"use strict";

/**
 * (C) Copyright Zachary Martin 2018.
 * Use, modification and distribution are subject to the
 * Boost Software License:
 *
 * Permission is hereby granted, free of charge, to any person or organization
 * obtaining a copy of the software and accompanying documentation covered by
 * this license (the "Software") to use, reproduce, display, distribute,
 * execute, and transmit the Software, and to prepare derivative works of the
 * Software, and to permit third-parties to whom the Software is furnished to
 * do so, all subject to the following:
 *
 * The copyright notices in the Software and this entire statement, including
 * the above license grant, this restriction and the following disclaimer,
 * must be included in all copies of the Software, in whole or in part, and
 * all derivative works of the Software, unless such copies or derivative
 * works are solely in the form of machine-executable object code generated by
 * a source language processor.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE SOFTWARE BE LIABLE
 * FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */


/**
 * The basic idea here for calculating exp(x) is based on the observation:
 *
 *              exp(x) = exp((k*r) + (m * ln2)) = (2^m)*(exp(r)^k)
 *
 * and that the exponential of r can be calculated quickly and accurately using the
 * Taylor Series approximation of exp, if r is sufficiently close to 0.
 *
 * Thus we choose:
 *
 *  m = mod(x, ln2, "round").quotient
 *
 * Since x = k*r + m*ln2 we know:
 *
 *  k*r = mod(x, ln2, "round").remainder < 0.5 * ln2
 *
 * If we take k to be a positive power of 2 that is sufficiently large then we can
 * guarantee that r is arbitrarily small, i.e.:
 *
 *  |r| <= (1/(2*k)) * ln2
 *
 * Note choosing k as a power of 2 makes taking the power (exp(r))^k especially easy.
 *
 * This is based on section 5.1, p.17 of the paper
 * "Library for Double-Double and Quad-Double Arithmetic"
 * by Yozo Hida, Xiaoye S. Li, and David H. Bailey
 */
export class Exp {

  // class constants
  public static kTable: { [numDigits: number]: { intVal: int, reciprocal: float } };

  public static init0(): void {
    Exp.kTable = {};
  }

  public static f(x: float, p: P): float {
    if (Comparison.isFinite(x)) {
      let twoToM: float;
      let rk: float;

      if (Comparison.gte(Sign.absF(x), LN2.value(p))) {
        const modLN2 = Exp.modLN2(x, p);
        const m = modLN2.q;
        twoToM = Pow.fi(C.F_2, m, p);
        rk = modLN2.r;
      } else {
        if (Comparison.lt(Basic.squareF(x, p), p.epsilon)) {
          return Basic.addFF(C.F_1, x, p);
        }

        // in this case m = 0, rk = x
        twoToM = C.F_1;
        rk = x;
      }

      const k = Exp.getKTableEntry(p);
      const r = Basic.multiplyFF(rk, k.reciprocal, p);

      // When k is large (high precisions), we need to extract out as much precision as
      // possible from the taylor series result before taking the k power. Adding 1 to the
      // taylor series result, causes the loss of some precision in that taylor series
      // value, so we bump up the precision for the addition, depending on k int value
      // number of digits. This mirrors the bump up in precision in Pow.fi for large
      // exponents
      const expR = Basic.addFF(
        Exp.taylorSeries(r, p),
        C.F_1,
        PREC.getRelativeP(p, k.intVal.digits.length)
      );
      const expRToK = Pow.fi(expR, k.intVal, p);

      return Basic.multiplyFF(twoToM, expRToK, p);
    } else if (Comparison.isNaN(x)) {
      throw new NaNError("Exp", "f", "x");
    } else if (Comparison.isPOSITIVE_INFINITY(x)) {
      return C.F_POSITIVE_INFINITY;
    } else { // x === NEGATIVE_INFINITY
      return C.F_0;
    }
  }

  public static m1F(x: float, p: P): float {
    if (Comparison.isFinite(x)) {
      const absX = Sign.absF(x);
      let calcPrec: P;

      if (Comparison.lt(absX, C.F_BASE_RECIPROCAL)) {
        return Exp.taylorSeries(x, p);
      } else if (Comparison.lt(absX, C.F_1)) {
        calcPrec = PREC.getRelativeP(p, 1);
      } else {
        calcPrec = p;
      }

      return Basic.subtractFF(Exp.f(x, calcPrec), C.F_1, calcPrec);
    } else if (Comparison.isNaN(x)) {
      throw new NaNError("Exp", "m1f", "x");
    } else if (Comparison.isPOSITIVE_INFINITY(x)) {
      return C.F_POSITIVE_INFINITY;
    } else { // x === NEGATIVE_INFINITY
      return C.F_NEG_1;
    }
  }

  private static getKTableEntry(p: P): { intVal: int, reciprocal: float } {
    const key = p.baseDigits - 1;

    if (typeof Exp.kTable[key] === "undefined") {
      const kFloat = Pow.fi(
        C.F_2,
        Core.numberToIntUnchecked(key),
        p
      );

      Exp.kTable[key] = {
        intVal: Conversion.floatToInt(kFloat),
        reciprocal: Basic.reciprocalF(kFloat, p)
      }
    }

    return Exp.kTable[key];
  }

  /**
   * The taylor series for the exponential function minus one, that is exp(x) - 1, is:
   *      infinity
   *      ----          n
   *      \           x
   *       \     ____________
   *       /
   *      /          n!
   *      ----
   *      n = 1
   *
   * This function approximates this series. It converges most quickly when x is close to
   * zero.
   */
  private static taylorSeries(x: float, p: P): float {
    let sumNum: float = x;
    let sumDenom: float = C.F_1;
    let power: float = x;
    let factorial: float = C.F_1;
    let sntd: float;
    let sdtn: float;
    let absEpsTimesSNTD: float;
    let n = 2;
    let keepGoing = true;

    while (keepGoing) {
      power = Basic.multiplyFF(power, x, p);
      factorial = n <= FactorialTable.maxIndex ?
        FactorialTable.float(n)
        :
        Basic.multiplyFF(factorial, Core.numberToFloatUnchecked(n), p);
      sntd = Basic.multiplyFF(sumNum, factorial, p);
      sdtn = Basic.multiplyFF(sumDenom, power, p);
      absEpsTimesSNTD = Sign.absF(Basic.multiplyFF(p.epsilon, sntd, p));

      if (Comparison.gte(absEpsTimesSNTD, Sign.absF(sdtn))) {
        keepGoing = false;
      }

      sumNum = Basic.addFF(sntd, sdtn, p);
      sumDenom = Basic.multiplyFF(sumDenom, factorial, p);
      n++;
    }

    return Basic.divideFF(sumNum, sumDenom, p);
  }

  private static modLN2(x: float, p: P): { q: int, r: float } {
    const xExponentNum = Core.intToNumber(x.exp);
    const modPrec = PREC.getPFromBaseDigits(Math.max(
      3,
      (p.baseDigits - 1) * 2 + xExponentNum
    ));
    const qUnrounded = Basic.multiplyFF(x, LN2.reciprocal(modPrec), modPrec);
    const q = Conversion.floatToInt(qUnrounded, "round");
    const rDivLN2 = Basic.subtractFF(
      qUnrounded,
      Conversion.intToFloat(q, modPrec, true),
      modPrec
    );

    return {q: q, r: Basic.multiplyFF(rDivLN2, LN2.value(p), p)};
  }
}


// *** imports come at end to avoid circular dependency ***

// interface imports
import {float} from "../interfaces/float";
import {int} from "../interfaces/int";

// functional imports
import {Sign as SignAlias} from "./Sign";
const Sign = SignAlias;

import {C as CAlias} from "../constants/C";
const C = CAlias;

import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;

import {Comparison as ComparisonAlias} from "./Comparison";
const Comparison = ComparisonAlias;

import {Conversion as ConversionAlias} from "../core/Conversion";
const Conversion = ConversionAlias;

import {Basic as BasicAlias} from "./Basic";
const Basic = BasicAlias;

import {Pow as PowAlias} from "./Pow";
const Pow = PowAlias;

import {FactorialTable as FactorialTableAlias} from "../constants/FactorialTable";
const FactorialTable = FactorialTableAlias;

import {LN2 as LN2Alias} from "../constants/LN2";
const LN2 = LN2Alias;

import {NaNError as NaNErrorAlias} from "../errors/NaNError";
const NaNError = NaNErrorAlias;

import {PREC as PRECAlias} from "../constants/PREC";
const PREC = PRECAlias;

import {P as PAlias} from "../dataTypes/P";
export type P = PAlias;

