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

import {int} from "../interfaces/int";
import {float} from "../interfaces/float";

// functional imports
import {Integer as IntegerAlias} from "../dataTypes/Integer";
const Integer = IntegerAlias;

import {Float as FloatAlias} from "../dataTypes/Float";
const Float = FloatAlias;

import {C as CAlias} from "../constants/C";
const C = CAlias;

import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;

import {Comparison as ComparisonAlias} from "./Comparison";
const Comparison = ComparisonAlias;

import {P as PAlias} from "../core/P";
const P = PAlias;
export type P = PAlias;

import {Sign as SignAlias} from "./Sign";
const Sign = SignAlias;

import {Basic as BasicAlias} from "./Basic";
const Basic = BasicAlias;

import {Parity as ParityAlias} from "./Parity";
const Parity = ParityAlias;

export class Pow {

  /**
   *
   * @param {int} base
   * @param {int} exponent must be >= 0
   * @returns {Number}
   */
  public static ii(base: int, exponent: int): int {
    if (Comparison.isNaN_I(base) || Comparison.isNaN_I(exponent)) {
      return C.NaN;
    } else if (Comparison.isZeroI(exponent) || Comparison.isOneI(base)) {
      return C.I_1;
    } else if (Comparison.isZeroI(base)) {
      return C.I_0;
    } else if (Comparison.isNegativeI(exponent)) {
      throw new Error("Cannot take negative exponents in integer pow function");
    } else if (Comparison.isPOSITIVE_INFINITY_I(exponent)) {
      if (Comparison.isPositiveI(base)) {
        return C.POSITIVE_INFINITY;
      } else {
        return C.NaN;
      }
    } else if (Comparison.isPOSITIVE_INFINITY_I(base)){
      return C.POSITIVE_INFINITY;
    } else if (Comparison.isNEGATIVE_INFINITY_I(base)){
      if (Parity.isOddI(exponent)) {
        return C.NEGATIVE_INFINITY;
      } else {
        return C.POSITIVE_INFINITY;
      }
    }

    return Pow.positiveIntegerExponentII(base, exponent);
  }

  public static fi(base: float, exponent: int, prec: P): float {
    if (Comparison.isNaN(base) || Comparison.isNaN_I(exponent)) {
      return C.F_NaN;
    } else if (Comparison.isZeroI(exponent) || Comparison.isOne(base)) {
      return C.F_1;
    } else if (Comparison.isZero(base)) {
      return C.F_0;
    } else if (Comparison.isPOSITIVE_INFINITY_I(exponent)) {
      if (Comparison.isPositive(base)) {
        return C.F_POSITIVE_INFINITY;
      } else {
        return C.F_NaN;
      }
    } else if (Comparison.isPOSITIVE_INFINITY(base)){
      return C.F_POSITIVE_INFINITY;
    } else if (Comparison.isNEGATIVE_INFINITY(base)){
      if (Parity.isOddI(exponent)) {
        return C.F_NEGATIVE_INFINITY;
      } else {
        return C.F_POSITIVE_INFINITY;
      }
    }

    const result = Pow.positiveIntegerExponentFI(base, Sign.absI(exponent), prec);

    if (Comparison.isNegativeI(exponent)) {
      if (Comparison.isZero(result)
        && Parity.isOddI(exponent)
        && Comparison.isNegative(base)) {
        return C.F_NEGATIVE_INFINITY;
      } else {
        return  Basic.reciprocalF(result, prec);
      }
    } else {
      return result;
    }
  }

  /**
   * This function uses exponentiation by squaring to find base to the exponent power
   * when the exponent is a positive integer. No error checking is done by this function,
   * it is up to the user to make sure the exponent is a positive integer
   */
  public static positiveIntegerExponentII(base: int, exponent: int): int {
    let s = C.I_1;
    let r = base;
    let n = exponent;

    while (Comparison.isPositiveI(n)) {
      if (Parity.isOddI(n)) {
        s = Basic.multiplyII(s, r);
      }

      n = Basic.divideII(n, C.I_2).q; // make sure to trunc this in float version

      if (Comparison.isPositiveI(n)) {
        r = Basic.squareI(r);
      }

    }

    return s;
  }

  /**
   * This function uses exponentiation by squaring to find base to the exponent power
   * when the exponent is a positive integer. No error checking is done by this function,
   * it is up to the user to make sure the exponent is a positive integer
   */
  public static positiveIntegerExponentFI(
    base: float,
    exponent: int,
    prec?: P
  ): float {
    if (!prec) { prec = P.p; }

    const precToUse = P.createRelativeP(prec, exponent.digits.length);

    let s = C.F_1;
    let r = base;
    let n = exponent;

    while (Comparison.isPositiveI(n)) {
      if (Parity.isOddI(n)) {
        s = Basic.multiplyFF(s, r, precToUse);
      }

      n = Basic.divideII(n, C.I_2).q; // make sure to trunc this in float version

      if (Comparison.isPositiveI(n)) {
        r = Basic.squareF(r, precToUse);
      }

    }

    return s;
  }
}