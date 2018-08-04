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
 * The basic idea for calculating the natural log of x is to use a series which converges
 * when x > 0 and converges quickly (more quickly than the Taylor series) when x is close
 * to 1. To effectively use this fact we take an approximation
 * of
 *      ~                           x                  ~        if y is a decent
 *   y  ~  log(x)   to get   a = ------ ,  Note that a ~  1     approximation to
 *      ~                        exp(y)                ~        log(x)
 *
 * thus we find log(a) with the series and then find log(x) using the fact that:
 *
 *  log(x) = log(exp(y) * (x/exp(y)))  = y + log(x/exp(y))  = y + log(a)
 *
 */
export class Log {
  private static _table: {[n: number]: {value: float, baseDigits: number}};

  public static init0(): void { Log._table = {}; }

  public static f(x: float, p: P): float {
    if (Comparison.isNaN(x)) {
      throw new NaNError("Log", "f", "x");
    } else if (Comparison.isPOSITIVE_INFINITY(x)) {
      return C.F_POSITIVE_INFINITY;
    } else if (Comparison.isPositive(x)) {
      const sciNoteX = SciNote.base2Exact(x);

      return Basic.addFF(
        Log.newtonsMethod(sciNoteX.c, p),
        Basic.multiplyFF(LN2.value(p), sciNoteX.e, p),
        p
      );
    } else if (Comparison.isZero(x)) {
      return C.F_NEGATIVE_INFINITY;
    } else { // x is finite negative or NEGATIVE_INFINITY
      throw new DomainError(
        "Log",
        "f",
        {x: {value: x, expectedType: "float"}},
        "The natural logarithm is undefined for negative values"
      );
    }
  }

  public static valueFromTable(n: number, p: P): float {
    let entry = Log._table[n];

    if (typeof entry === "undefined" || entry.baseDigits < p.baseDigits) {
      entry = {
        value: Log.f(Core.numberToFloatUnchecked(n), p),
        baseDigits: p.baseDigits
      };
      Log._table[n] = entry;
    }

    return entry.value;
  }

  public static baseFF(x: float, base: float, p: P): float {
    const functionName = "baseFF";

    if (Comparison.isNaN(x) || Comparison.isNaN(base)) {
      throw new NaNError(
        "Log",
        functionName,
        Comparison.isNaN(x) ? "x" : "base"
      );
    } else if (!Comparison.isPositive(base)) {
      throw new DomainError(
        "Log",
        functionName,
        {
          x: {value: x, expectedType: "float"},
          base: {value: base, expectedType: "float"}
        },
        "The logarithm with a non-positive base is undefined"
      );
    } else if (Comparison.isPositive(x)) {
      if (Comparison.isOne(x)) { // x = 1 always implies result of 0
        return C.F_0;
      } else if (Comparison.isOne(base)) {
        // base = 1 for any x other than 1 should throw an error
        throw new DomainError(
          "Log",
          functionName,
          {
            x: {value: x, expectedType: "float"},
            base: {value: base, expectedType: "float"}
          },
          "The logarithm base 1 for any x other than 1 is undefined"
        );
      } else {
        const num = Log.f(x, p);
        let denom: float;

        if (Comparison.equals(base, C.F_2)) {
          denom = LN2.value(p);
        } else if (Conversion.isInteger(base)
          && Comparison.lte(base, WHOLE.float(36))) {
          denom = Log.valueFromTable(Core.floatToNumber(base), p);
        } else {
          denom = Log.f(base, p);
        }

        return Basic.divideFF(num, denom, p);
      }
    } else if (Comparison.isZero(x)) {
      return Comparison.ltOne(base) ? C.F_POSITIVE_INFINITY : C.F_NEGATIVE_INFINITY;
    } else { // x < 0
      throw new DomainError(
        "Log",
        functionName,
        {
          x: {value: x, expectedType: "float"},
          base: {value: base, expectedType: "float"}
        },
        "The logarithm of a negative value is undefined"
      );
    }
  }

  public static twoF(x: float, p: P): float {
    return Log.baseFF(x, C.F_2, p);
  }

  public static tenF(x: float, p: P): float {
    return Log.baseFF(x, C.F_10, p);
  }

  public static onePlusF(x: float, p: P): float {
    const absX = Sign.absF(x);
    let calcPrec: P;

    if (Comparison.gtOne(absX)) {
      calcPrec = p;
    } else if (Comparison.lte(absX, C.F_BASE_RECIPROCAL)) {
      return Log.onePTaylorSeries(x, p);
    } else { // C.F_BASE_RECIPROCAL < |x| <= 1
      calcPrec = PREC.getRelativeP(p, 1);
    }

    return Log.f(Basic.incF(x, calcPrec), calcPrec);
  }


  /**
   * This function approximates the terms of the series for log(1+x):
   *
   *     infinity
   *      ----         n+1    n
   *      \        (-1)   * x
   *       \     ______________
   *       /
   *      /             n
   *      ----
   *      n = 1
   * @param x
   * @param p
   */
  private static onePTaylorSeries(x: float, p: P): float {
    let sumNum: float = x;
    let sumDenom: float = C.F_1;
    let negative: boolean = false;
    let power: float = x;
    let termNum: float;
    let sntd: float;
    let sdtn: float;
    let absEpsTimesSNTD: float;
    let n: number = 1;
    let nFloat: float;
    let keepGoing = true;

    while(keepGoing) {
      negative = !negative;
      n++;
      nFloat = Core.numberToFloatUnchecked(n);
      power = Basic.multiplyFF(power, x, p);
      termNum = negative ? Sign.negateF(power) : power;
      sntd = Basic.multiplyFF(sumNum, nFloat, p);
      sdtn = Basic.multiplyFF(sumDenom, power, p);
      absEpsTimesSNTD = Sign.absF(Basic.multiplyFF(p.epsilon, sntd, p));

      if (Comparison.gte(absEpsTimesSNTD, Sign.absF(sdtn))) { keepGoing = false; }

      sumNum = Basic.addFF(sntd, sdtn, p);
      sumDenom = n <= FactorialTable.maxIndex ?
        FactorialTable.float(n)
        :
        Basic.multiplyFF(sumDenom, nFloat, p);
    }

    return Basic.divideFF(sumNum, sumDenom, p);
  }

  // /**
  //  * This function calculates the logarithm of a Val x using the series:
  //  *
  //  *      infinity
  //  *      ----                    __            __  (2n + 1)
  //  *      \            1         |     x - 1      |
  //  * 2 *   \     ______________  | ______________ |
  //  *       /        2n + 1       |     x + 1      |
  //  *      /                      |__            __|
  //  *      ----
  //  *      n = 0
  //  *
  //  * which converges to the natural log of x when x > 0. It converges quickly (more
  //  * quickly than the Taylor series) when x is close to 1.
  //  * @param x
  //  * @param p: P
  //  * @returns {Val}
  //  */
  // private static near1(x: float, p: P): float {
  //   const xMinus1: float = Basic.decF(x, p);
  //   const xPlus1: float = Basic.incF(x, p);
  //   const xMinus1Squared = Basic.squareF(xMinus1, p);
  //   const xPlus1Squared = Basic.squareF(xPlus1, p);
  //   let sumNum: float = xMinus1;
  //   let sumDenom: float = xPlus1;
  //   let termNum: float = xMinus1;
  //   let termDenom: float = xPlus1;
  //   let denomCoef: number = 1;
  //   let denomPower: float = xPlus1;
  //   let sntd: float;
  //   let sdtn: float;
  //   let absEpsTimesSNTD: float;
  //   let keepGoing = true;
  //
  //   while(keepGoing) {
  //     termNum = Basic.multiplyFF(termNum, xMinus1Squared, p);
  //     denomCoef += 2;
  //     denomPower = Basic.multiplyFF(denomPower, xPlus1Squared, p);
  //     termDenom = Basic.multiplyFF(
  //       Core.numberToFloatUnchecked(denomCoef),
  //       denomPower,
  //       p
  //     );
  //     sntd = Basic.multiplyFF(sumNum, termDenom, p);
  //     sdtn = Basic.multiplyFF(sumDenom, termNum, p);
  //     absEpsTimesSNTD = Sign.absF(Basic.multiplyFF(p.epsilon, sntd, p));
  //
  //     if (Comparison.gte(absEpsTimesSNTD, Sign.absF(sdtn))) { keepGoing = false; }
  //
  //     sumNum = Basic.addFF(sntd, sdtn, p);
  //     sumDenom = Basic.multiplyFF(sumDenom, termDenom, p);
  //   }
  //
  //   return Basic.multiplyFF(C.F_2, Basic.divideFF(sumNum, sumDenom, p), p);
  // }

  /**
   * This function approximates the log of x with number precision by using the sciNote
   * function which gives a number c and an int e such that:
   *    |x| =approx= c * BASE^e
   *
   * thus we have:
   *
   * log(x) =approx= log(c * BASE^e)
   *        =approx= log(c) + 26 * e * LN2
   *
   * @param {float} x
   * @returns {float}
   */
  private static approx(x: float): float {
    // Using Number functions can't give us better accuracy than 3 digits
    const approxPrec = PREC.getPFromBaseDigits(3);
    const sciNote = Basic.sciNoteBASEApprox(x);
    const logc = Core.numberToFloatUnchecked(Math.log(sciNote.c));
    const eTimesBasePowerOf2 = Basic.multiplyII(C.POWER_OF_TWO_FOR_BASE_INT, sciNote.e);

    return Basic.addFF(
      logc,
      Basic.multiplyFF(
        Conversion.intToFloat(eTimesBasePowerOf2, approxPrec, true),
        LN2.value(approxPrec),
        approxPrec
      ),
      approxPrec
    );
  }

  private static newtonsMethod(x: float, p: P): float {
    const steps = p.quadraticConvergenceSteps;
    let xi: float = Log.approx(x);
    let expXi: float;
    let xTimesExpXiMinus1: float;

    for(let i = 1; i <= steps; i++) {
      expXi = Exp.f(Sign.negateF(xi), p);
      xTimesExpXiMinus1 = Basic.decF(Basic.multiplyFF(x, expXi, p), p);
      xi = Basic.addFF(xi, xTimesExpXiMinus1, p);
    }

    return xi;
  }
}


// *** imports come at end to avoid circular dependency ***

import {float} from "../interfaces/float";

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

import {SciNote as SciNoteAlias} from "../core/SciNote";
const SciNote = SciNoteAlias;

import {Exp as ExpAlias} from "./Exp";
const Exp = ExpAlias;

import {LN2 as LN2Alias} from "../constants/LN2";
const LN2 = LN2Alias;

import {WHOLE as WHOLEAlias} from "../constants/WHOLE";
const WHOLE = WHOLEAlias;

import {FactorialTable as FactorialTableAlias} from "../constants/FactorialTable";
const FactorialTable = FactorialTableAlias;

import {NaNError as NaNErrorAlias} from "../errors/NaNError";
const NaNError = NaNErrorAlias;

import {DomainError as DomainErrorAlias} from "../errors/DomainError";
const DomainError = DomainErrorAlias;

import {P as PAlias} from "../dataTypes/P";
export type P = PAlias;

import {PREC as PRECAlias} from "../constants/PREC";
const PREC = PRECAlias;
