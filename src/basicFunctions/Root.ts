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


export class Root {
  public static className: string;
  private static _table: {[n: number]: {[x: number]: {value: float, baseDigits: number}}};
  private static approxPrec: P;

  public static init0(): void {
    Root.className = "Root";
    Root._table = {};
  }

  public static init1(): void {
    // Using Number functions can't gives us much better accuracy than 3 BASE digits
    Root.approxPrec = new P(3, "base");
  }


  public static squareF(x: float, p: P): float {
    if (Comparison.isNaN(x)) {
      throw new NaNError(Root.className, "squareF", "x");
    } else if (Comparison.isNegative(x)) {
      throw new DomainError(
        Root.className,
        "squareF",
        {x: {value: x, expectedType: "float"}},
        "The square root function is not defined for negative values."
      )
    } else if (Comparison.isZero(x)) {
      return C.F_0;
    } else if (Comparison.isPOSITIVE_INFINITY(x)) {
      return C.F_POSITIVE_INFINITY;
    } else {
      return Root.newtonsMethodSqrt(x, p)
    }
  }

  public static fn(x: float, n: number, p: P) {
    if (Comparison.isNaN(x) || Number.isNaN(n)) {
      throw new NaNError(
        Root.className,
        "fn",
        Comparison.isNaN(x) ? "x" : "n"
      );
    } else if (!Number.isInteger(n) || n > Number.MAX_SAFE_INTEGER ||
               n < Number.MIN_SAFE_INTEGER) {
      throw new DomainError(
        Root.className,
        "fn",
        {
          x: {value: x, expectedType: "float"},
          n: {value: n, expectedType: "number"}
        },
        `The root function is undefined for non-integer degrees or degrees that are${""
        } greater than Number.MAX_SAFE_INTEGER or less than Number.MIN_SAFE_INTEGER.`
      )
    } else if (n % 2 === 0 && Comparison.isNegative(x)) {
      throw new DomainError(
        Root.className,
        "fn",
        {
          x: {value: x, expectedType: "float"},
          n: {value: n, expectedType: "number"}
        },
        `The root function is undefined for even degrees on negative values.`
      )
    } else if (Comparison.isFinite(x)) {
      if (Comparison.isZero(x)) {
        return n < 0 ? C.F_POSITIVE_INFINITY : C.F_0;
      }

      const absX = Sign.absF(x);
      const absResult = Root.newtonsMethodGeneral(absX, n, p);

      return Comparison.isNegative(x) ? Sign.negateF(absResult) : absResult;
    } else { // x is +/- infinity
      if (n < 0) {
        return C.F_0;
      } else {
        return x;
      }
    }
  }

  public static valueFromTable(x: number, n: number, p: P): float {
    const negative = x < 0;

    if (x < 0) { x = Math.abs(x); }

    if (typeof Root._table[n] === "undefined") { Root._table[n] = {}; }

    let entry = Root._table[n][x];

    if (typeof entry === "undefined") {
      const xFloat = Core.numberToFloatUnchecked(x);
      const value = n === 2 ? Root.squareF(xFloat, p) : Root.fn(xFloat, n, p);
      entry = {
        value: value,
        baseDigits: p.baseDigits
      };
      Root._table[n][x] = entry;
    } else if (entry.baseDigits < p.baseDigits) {
      const xFloat = Core.numberToFloatUnchecked(x);
      entry.value = n === 2 ? Root.squareF(xFloat, p) : Root.fn(xFloat, n, p);
      entry.baseDigits = p.baseDigits;
    }

    return negative ? Sign.negateF(entry.value) : entry.value;
  }

  private static approx(x: float, n: number): float {
    const nInt = Core.numberToIntUnchecked(n);

    const sciNote = Basic.sciNoteBASEApprox(x);
    const coefNum = sciNote.c;

    const coefRootApprox = Core.numberToFloatUnchecked(Math.pow(coefNum, 1/n));

    const expDivN = Basic.divideII(
      Basic.multiplyII(sciNote.e, C.POWER_OF_TWO_FOR_BASE_INT),
      nInt,
      "round"
    );
    const twoToExNQuotient: float = Pow.fi(C.F_2, expDivN.quotient, Root.approxPrec);
    const remainderNum = Core.intToNumber(expDivN.remainder);

    let nthRootOf2toEx: float;

    if (Comparison.isZeroI(expDivN.remainder)) {
      nthRootOf2toEx = twoToExNQuotient;
    } else {
      const twoToRemainderDivN = Core.numberToFloat(Math.pow(2, remainderNum/n));

      nthRootOf2toEx = Basic.multiplyFF(
        twoToExNQuotient,
        twoToRemainderDivN,
        Root.approxPrec
      );
    }

    return Basic.multiplyFF(coefRootApprox, nthRootOf2toEx, Root.approxPrec);
  }


  /**
   * Newton method based on f(xi) = (xi^-2) - x, which has roots at +/-(x^-(1/2))
   * @param {float} x - a positive float
   * @param {P} prec
   * @returns {float}
   */
  private static newtonsMethodSqrt(x: float, prec: P): float {
    const steps = prec.quadraticConvergenceSteps;
    const xNum = Core.floatToNumber(x);
    const guess = Number.isFinite(xNum) && xNum !== 0 ?
      Core.numberToFloat(Math.pow(xNum, -1/2))
      :
      Root.approx(x, -2);
    let xi = guess;
    let oneMinusXTimesXiSquared: float;

    for (let i = 0; i < steps; i++) {
      oneMinusXTimesXiSquared = Basic.subtractFF(
        C.F_1,
        Basic.multiplyFF(x, Basic.squareF(xi, prec), prec),
        prec
      );

      if (Comparison.isZero(oneMinusXTimesXiSquared)) { break; }

      xi = Basic.addFF(
        xi,
        Basic.productF([C.F_ONE_HALF, xi, oneMinusXTimesXiSquared], prec),
        prec
      );
    }

    return Basic.multiplyFF(x, xi, prec);
  }

  /**
   * Newton method based on f(xi) = (xi^-n) - x, which has roots at +/-(x^-(1/n))
   * @param {float} x - a positive float
   * @param {number} n
   * @param {P} prec
   * @returns {float}
   */
  private static newtonsMethodGeneral(x: float, n: number, prec: P): float {
    const steps = prec.quadraticConvergenceSteps;
    const xNum = Core.floatToNumber(x);
    const nInt = Core.numberToInt(n);
    const recipN = n < 100 ?
      RATIO.value(1, n, prec)
      :
      Basic.reciprocalF(Core.numberToFloatUnchecked(n), prec);
    const guess = Number.isFinite(xNum) && xNum !== 0 ?
      Core.numberToFloat(Math.pow(xNum, -1/n))
      :
      Root.approx(x, -n);

    let xi: float = guess;
    let oneMinusXTimesXiToN: float;

    for (let i = 0; i < steps; i++) {
      oneMinusXTimesXiToN = Basic.subtractFF(
        C.F_1,
        Basic.multiplyFF(x, Pow.fi(xi, nInt, prec), prec),
        prec
      );

      if (Comparison.isZero(oneMinusXTimesXiToN)) { break; }

      xi = Basic.addFF(
        xi,
        Basic.productF([recipN, xi, oneMinusXTimesXiToN], prec),
        prec
      );
    }

    return Basic.reciprocalF(xi, prec);
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      C, Sign, Comparison, P, Core, Pow, Basic, RATIO, NaNError, DomainError,
    ]);
  }
}


// *** imports come at end to avoid circular dependency ***

// interface imports
import {float} from "../interfacesAndTypes/float";
import {Class} from "../interfacesAndTypes/Class";


// functional imports
import {C as CAlias} from "../constants/C";
const C = CAlias;

import {Sign as SignAlias} from "./Sign";
const Sign = SignAlias;

import {Comparison as ComparisonAlias} from "./Comparison";
const Comparison = ComparisonAlias;

import {P as PAlias} from "../dataTypes/P";
const P = PAlias;
export type P = PAlias;

import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;

import {Pow as PowAlias} from "./Pow";
const Pow = PowAlias;

import {Basic as BasicAlias} from "./Basic";
const Basic = BasicAlias;

import {RATIO as RATIOAlias} from "../constants/RATIO";
const RATIO = RATIOAlias;

import {NaNError as NaNErrorAlias} from "../errors/NaNError";
const NaNError = NaNErrorAlias;

import {DomainError as DomainErrorAlias} from "../errors/DomainError";
const DomainError = DomainErrorAlias;