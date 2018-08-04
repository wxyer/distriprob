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


export class Conversion {

  public static intToFloat(a: int, p: P, sameUint32Array: boolean): float {
    if (Comparison.isNaN_I(a)) { return C.F_NaN; }
    if (Comparison.isPOSITIVE_INFINITY_I(a)) { return C.F_POSITIVE_INFINITY; }
    if (Comparison.isNEGATIVE_INFINITY_I(a)) { return C.F_NEGATIVE_INFINITY; }

    const exp: int = Core.numberToInt((a.digits.length - 1));
    let coef: int;
    let sliceEndIndex = Math.min(p.baseDigits, a.digits.length);
    let sliceEndIndexMinus1 = sliceEndIndex - 1;

    while(sliceEndIndexMinus1 > 1 && a.digits[sliceEndIndexMinus1] === 0) {
      sliceEndIndexMinus1--;
    }

    sliceEndIndex = sliceEndIndexMinus1 + 1;

    if (sliceEndIndex === a.digits.length) {
      coef = a;
    } else {
      if (sameUint32Array) {
        coef = new Integer(a.neg, a.digits.subarray(0, sliceEndIndex));
      } else {
        coef = new Integer(a.neg, a.digits.slice(0, sliceEndIndex));
      }
    }

    return new FloatingPoint(coef, exp);
  }

  public static intToFloatFullPrecision(a: int, sameUint32Array: boolean): float {
    const prec = PREC.getPFromBaseDigits(a.digits.length);
    return Conversion.intToFloat(a, prec, sameUint32Array);
  }

  public static isInteger(x: float): boolean {
    return Comparison.isFinite(x) ?
      !Comparison.isNegativeI(Basic.leastSigDigPlaceF(x))
      :
      false;
  }

  public static round(x: float): float {
    if (!Comparison.isFinite(x)) { return x; }

    const leastSigDigPlace = Basic.leastSigDigPlaceF(x);

    if (!Comparison.isNegativeI(leastSigDigPlace)) { // fractional part of x === 0
      return x;
    } else if (Comparison.equalsI(x.exp, C.I_NEG_1)) { // 1/BASE =< |x| < 1
      if (x.coef.digits[0] >= C.BASE_DIV_2) {
        return x.coef.neg ? C.F_NEG_1 : C.F_1;
      } else {
        return C.F_0;
      }
    } else if (Comparison.isNegativeI(x.exp)) { // |x| < 1/BASE
      return C.F_0;
    } else { // integer part of x !== 0 and fractional part of x !== 0
      const placesBelowZero = -Core.intToNumber(leastSigDigPlace);
      const positionNegativeOneIndex = x.coef.digits.length - placesBelowZero;
      const digitAtPositionNegativeOne = x.coef.digits[positionNegativeOneIndex];

      let digits = x.coef.digits.slice(0, positionNegativeOneIndex);

      if (digitAtPositionNegativeOne >= C.BASE_DIV_2) {
        digits = Longhand.addition(digits, C.ARR_1);
      }

      return new FloatingPoint(new Integer(x.coef.neg, digits), x.exp);
    }
  }

  public static trunc(x: float): float {
    if (!Comparison.isFinite(x)) { return x; }

    const leastSigDigPlace = Basic.leastSigDigPlaceF(x);

    if (!Comparison.isNegativeI(leastSigDigPlace)) { // fractional part of x === 0
      return x;
    } else if (Comparison.isNegativeI(x.exp)) { // |x| < 1
      return C.F_0;
    } else { // integer part of x !== 0 and fractional part of x !== 0
      const placesBelowZero = -Core.intToNumber(leastSigDigPlace);
      const positionNegativeOneIndex = x.coef.digits.length - placesBelowZero;
      const digits = x.coef.digits.slice(0, positionNegativeOneIndex);

      return new FloatingPoint(new Integer(x.coef.neg, digits), x.exp);
    }
  }

  public static floor(x: float): float {
    if (!Comparison.isFinite(x)) { return x; }

    const leastSigDigPlace = Basic.leastSigDigPlaceF(x);

    if (!Comparison.isNegativeI(leastSigDigPlace)) { // fractional part of x === 0
      return x;
    } else if (Comparison.isNegativeI(x.exp)) { // |x| < 1
      return x.coef.neg ? C.F_NEG_1 : C.F_0;
    } else { // integer part of x !== 0 and fractional part of x !== 0
      const placesBelowZero = -Core.intToNumber(leastSigDigPlace);
      const positionNegativeOneIndex = x.coef.digits.length - placesBelowZero;
      let digits = x.coef.digits.slice(0, positionNegativeOneIndex);

      if (x.coef.neg) {
        digits = Longhand.addition(digits, C.ARR_1);
      }

      return new FloatingPoint(new Integer(x.coef.neg, digits), x.exp);
    }
  }

  public static ceil(x: float): float {
    if (!Comparison.isFinite(x)) { return x; }

    const leastSigDigPlace = Basic.leastSigDigPlaceF(x);

    if (!Comparison.isNegativeI(leastSigDigPlace)) { // fractional part of x === 0
      return x;
    } else if (Comparison.isNegativeI(x.exp)) { // |x| < 1
      return x.coef.neg ? C.F_0 : C.F_1;
    } else { // integer part of x !== 0 and fractional part of x !== 0
      const placesBelowZero = -Core.intToNumber(leastSigDigPlace);
      const positionNegativeOneIndex = x.coef.digits.length - placesBelowZero;
      let digits = x.coef.digits.slice(0, positionNegativeOneIndex);

      if (!x.coef.neg) {
        digits = Longhand.addition(digits, C.ARR_1);
      }

      return new FloatingPoint(new Integer(x.coef.neg, digits), x.exp);
    }
  }


  public static floatToInt(
    x: float,
    type: "trunc" | "round" | "ceil" | "floor" = "trunc"
  ): int {
    if (Comparison.isNaN(x)) {
      return C.NaN;
    } else if (Comparison.isPOSITIVE_INFINITY(x)) {
      return C.POSITIVE_INFINITY;
    } else if (Comparison.isNEGATIVE_INFINITY(x)) {
      return C.NEGATIVE_INFINITY;
    } else {
      let floatingInt: float;

      if (type === "trunc") {
        floatingInt = Conversion.trunc(x);
      } else if (type === "round") {
        floatingInt = Conversion.round(x);
      } else if (type === "ceil") {
        floatingInt = Conversion.ceil(x);
      } else { // type === "floor"
        floatingInt = Conversion.floor(x);
      }

      const exp = Core.intToNumber(floatingInt.exp);
      const zerosToAdd = exp - floatingInt.coef.digits.length + 1;

      if (zerosToAdd > 0) {
        return Core.scaleIntByBase(floatingInt.coef, zerosToAdd);
      } else {
        return floatingInt.coef;
      }
    }
  }
}


// *** imports come at end to avoid circular dependency ***

// interface imports
import {int} from "../interfaces/int";
import {float} from "../interfaces/float";

// functional imports
import {Integer as IntegerAlias} from "../dataTypes/Integer";
const Integer = IntegerAlias;

import {FloatingPoint as FloatingPointAlias} from "../dataTypes/FloatingPoint";
const FloatingPoint = FloatingPointAlias;

import {C as CAlias} from "../constants/C";
const C = CAlias;

import {Core as CoreAlias} from "./Core";
const Core = CoreAlias;

import {Comparison as ComparisonAlias} from "../basicFunctions/Comparison";
const Comparison = ComparisonAlias;

import {P as PAlias} from "../dataTypes/P";
export type P = PAlias;

import {PREC as PRECAlias} from "../constants/PREC";
const PREC = PRECAlias;

import {Longhand as LonghandAlias} from "./Longhand";
const Longhand = LonghandAlias;

import {Basic as BasicAlias} from "../basicFunctions/Basic";
const Basic = BasicAlias;

