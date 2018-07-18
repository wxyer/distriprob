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

import {float} from "../interfaces/float";
import {int} from "../interfaces/int";

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

import {P as PAlias} from "../core/P";
const P = PAlias;
export type P = PAlias;

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

  public static f(x: float, prec: P): float {
    let twoToM: float;
    let rk: float;

    if (Comparison.gte(Sign.absF(x), LN2.value(prec))) {
      const modLN2 = Exp.modLN2(x, prec);
      const m = modLN2.q;
      twoToM = Pow.fi(C.F_2, m, prec);
      rk = modLN2.r;
    } else {
      if (Comparison.lt(Basic.squareF(x, prec), prec.epsilon)) {
        return Basic.addFF(C.F_1, x, prec);
      }

      // in this case m = 0, rk = x
      twoToM = C.F_1;
      rk = x;
    }

    const k = Exp.getKTableEntry(prec);
    const r = Basic.multiplyFF(rk, k.reciprocal, prec);

    // When k is large (high precisions), we need to extract out as much precision as
    // possible from the taylor series result before taking the k power. Adding 1 to the
    // taylor series result, causes the loss of some precision in that taylor series
    // value, so we bump up the precision for the addition, depending on k int value
    // number of digits. This mirrors the bump up in precision in Pow.fi for large
    // exponents
    const expR = Basic.addFF(
      Exp.taylorSeries(r, prec),
      C.F_1,
      P.createRelativeP(prec, k.intVal.digits.length)
    );
    const expRToK = Pow.fi(expR, k.intVal, prec);

    return Basic.multiplyFF(twoToM, expRToK, prec);
  }

  public static m1F(x: float, prec: P): float {
    const absX = Sign.absF(x);
    let calcPrec: P;

    if (Comparison.lt(absX, C.F_BASE_RECIPROCAL)) {
      return Exp.taylorSeries(x, prec);
    } else if (Comparison.lt(absX, C.F_1)) {
      calcPrec = P.createRelativeP(prec, 1);
    } else {
      calcPrec = prec;
    }

    return Basic.subtractFF(Exp.f(x, calcPrec), C.F_1, calcPrec);
  }

  private static getKTableEntry(prec: P): { intVal: int, reciprocal: float } {
    if (typeof Exp.kTable === "undefined") {
      Exp.kTable = {};
    }
    const key = prec.numDigits - 1;

    if (typeof Exp.kTable[key] === "undefined") {
      const kFloat = Pow.fi(
        C.F_2,
        Core.numberToIntUnchecked(key),
        prec
      );

      Exp.kTable[key] = {
        intVal: Conversion.floatToInt(kFloat),
        reciprocal: Basic.reciprocalF(kFloat, prec)
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
  public static taylorSeries(x: float, prec: P): float {
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
      power = Basic.multiplyFF(power, x, prec);
      factorial = n <= FactorialTable.maxIndex ?
        FactorialTable.float(n)
        :
        Basic.multiplyFF(factorial, Core.numberToFloatUnchecked(n), prec);
      sntd = Basic.multiplyFF(sumNum, factorial, prec);
      sdtn = Basic.multiplyFF(sumDenom, power, prec);
      absEpsTimesSNTD = Sign.absF(Basic.multiplyFF(prec.epsilon, sntd, prec));

      if (Comparison.gte(absEpsTimesSNTD, Sign.absF(sdtn))) {
        keepGoing = false;
      }

      sumNum = Basic.addFF(sntd, sdtn, prec);
      sumDenom = Basic.multiplyFF(sumDenom, factorial, prec);
      n++;
    }

    return Basic.divideFF(sumNum, sumDenom, prec);
  }

  public static modLN2(x: float, prec: P): { q: int, r: float } {
    const xExponentNum = Core.intToNumber(x.exp);
    const modPrec = P.createPFromNumDigits(Math.max(
      3,
      (prec.numDigits - 1) * 2 + xExponentNum
    ));
    const qUnrounded = Basic.multiplyFF(x, LN2.reciprocal(modPrec), modPrec);
    const q = Conversion.floatToInt(qUnrounded, "round");
    const rDivLN2 = Basic.subtractFF(
      qUnrounded,
      Conversion.intToFloat(q, modPrec, true),
      modPrec
    );

    return {q: q, r: Basic.multiplyFF(rDivLN2, LN2.value(prec), prec)};
  }
}

