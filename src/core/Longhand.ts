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


export class Longhand {
  public static className: string;

  public static init0(): void {
    Longhand.className = "Longhand";
  }

  /**
   * @param {number[]} a - an array of non-negative integers < BASE
   * @param {number[]} b - an array of non-negative integers < BASE
   * @returns {number[]} a + b
   */
  public static addition(a: Uint32Array, b: Uint32Array): Uint32Array {
    let longer: Uint32Array;
    let longerLength: number;
    let shorter: Uint32Array;
    let shorterLength: number;

    if (a.length > b.length) {
      longer = a;
      longerLength = a.length;
      shorter = b;
      shorterLength = b.length;
    } else {
      longer = b;
      longerLength = b.length;
      shorter = a;
      shorterLength = a.length;
    }

    let result: Uint32Array = new Uint32Array(longerLength + 1);
    let carry: boolean = false;
    let longerLengthMinusI: number;
    let longerLengthMinusIPlus1: number;
    let digit: number;

    for (let i = 1; i <= shorterLength; i++) {
      longerLengthMinusI = longerLength - i;
      longerLengthMinusIPlus1 = longerLengthMinusI + 1;
      digit = longer[longerLengthMinusI] + shorter[shorterLength - i];

      if (carry) {
        digit++;
      }

      if (digit >= C.BASE) {
        carry = true;
        digit = digit % C.BASE;
      } else {
        carry = false;
      }

      result[longerLengthMinusIPlus1] = digit;
    }

    for (let i = shorterLength + 1; i <= longerLength; i++) {
      longerLengthMinusI = longerLength - i;
      longerLengthMinusIPlus1 = longerLength - i + 1;
      result[longerLengthMinusIPlus1] = (longer[longerLengthMinusI]);

      if (carry) {
        if (result[longerLengthMinusIPlus1] < C.BASE_MINUS_ONE) {
          result[longerLengthMinusIPlus1]++;
          carry = false;
        } else {
          result[longerLengthMinusIPlus1] = 0;
        }
      }
    }

    if (carry) {
      result[0] = 1;
    } else {
      result = result.subarray(1);
    }

    return result;
  }

  /**
   * @param {number[]} a - an array of non-negative integers < BASE
   * @param {number[]} b - an array of non-negative integers < BASE
   * @returns {{result: Uint32Array, aGTEb: boolean}
   */
  public static subtraction(
    a: Uint32Array,
    b: Uint32Array
  ): {result: Uint32Array, aGTEb: boolean} {
    let larger: Uint32Array;
    let largerLength: number;
    let smaller: Uint32Array;
    let smallerLength: number;
    let aGTEb: boolean;

    const comparison = Comparison.compareArray(a, b);

    if (comparison > 0) {
      larger = a;
      largerLength = a.length;
      smaller = b;
      smallerLength = b.length;
      aGTEb = true;
    } else if (comparison < 0) {
      larger = b;
      largerLength = b.length;
      smaller = a;
      smallerLength = a.length;
      aGTEb = false;
    } else {
      return {result: new Uint32Array(1), aGTEb: true};
    }

    let result: Uint32Array = new Uint32Array(largerLength);
    let largerLengthMinusI: number;
    let carry: boolean = false;
    let digit: number;

    for (let i = 1; i <= smallerLength; i++) {
      largerLengthMinusI = largerLength - i;
      digit = larger[largerLengthMinusI] - smaller[smallerLength - i];

      if (carry) {
        digit--;
      }

      if (digit < 0) {
        carry = true;
        digit = C.BASE + digit;
      } else {
        carry = false;
      }

      result[largerLengthMinusI] = digit;
    }

    for (let i = smallerLength + 1; i <= largerLength; i++) {
      largerLengthMinusI = largerLength - i;
      result[largerLengthMinusI] = larger[largerLengthMinusI];

      if (carry) {
        if (result[largerLengthMinusI] > 0) {
          result[largerLengthMinusI]--;
          carry = false;
        } else {
          result[largerLengthMinusI] = C.BASE_MINUS_ONE;
        }
      }
    }

    result = Core.trimLeading(result);

    return {result: result, aGTEb: aGTEb}
  }

  /**
   * @param {number[]} a - an array of non-negative integers < BASE
   * @param {number[]} b - an array of non-negative integers < BASE
   * @returns {number[]} a * b
   */
  public static  multiplication(a: Uint32Array, b: Uint32Array): Uint32Array {
    let result: Uint32Array = new Uint32Array(a.length + b.length);
    let carry: number = 0;

    for (let i = a.length - 1; i >= 0; i--) {
      for (let j = b.length - 1; j >= 0; j--) {
        const resultIndex = i + j + 1;
        let digit = (a[i] * b[j]) + carry + result[resultIndex];

        if (digit >= C.BASE) {
          carry = Math.trunc(digit / C.BASE);
          digit = digit % C.BASE;
        } else {
          carry = 0;
        }

        result[resultIndex] = digit;
      }

      if (carry !== 0) {
        result[i] += carry;
        carry = 0;
      }
    }

    if (result[0] === 0 && result.length > 1) { result = result.subarray(1); }

    return result;
  }

  /**
   * @param {number[]} a - an array of non-negative integers < BASE
   * @param {number[]} b - an array of non-negative integers < BASE
   * @param {number} lengthLimit - the maximum length of the resulting product
   * approximation
   * @returns {number[]} a * b approximation with length <= lengthLimit
   */
  public static  multiplicationLengthLimit(
    a: Uint32Array,
    b: Uint32Array,
    lengthLimit: number
  ): {result: Uint32Array, expAdjustment: int} {
    const multLength = Math.min(
      a.length + b.length,
      lengthLimit + 3
    );
    const multLengthMinus1 = multLength - 1;
    let result: Uint32Array = new Uint32Array(multLength);
    let carry: number = 0;

    for (let i = Math.min(a.length - 1, multLengthMinus1); i >= 0; i--) {
      for (let j = Math.min(b.length - 1, multLengthMinus1); j >= 0; j--) {
        const resultIndex = i + j + 1;
        if (resultIndex <= multLengthMinus1) {
          let digit = (a[i] * b[j]) + carry + result[resultIndex];

          if (digit >= C.BASE) {
            carry = Math.trunc(digit / C.BASE);
            digit = digit % C.BASE;
          } else {
            carry = 0;
          }

          result[resultIndex] = digit;
        }
      }

      if (carry !== 0) {
        result[i] += carry;
        carry = 0;
      }
    }
    let leadingIndex = 0;
    let expAdjustment = C.I_1;
    let trailingIndexMinus1 = multLength - 1;

    if (result[0] === 0) {
      expAdjustment = C.I_0;
      leadingIndex = 1;
    }

    while(trailingIndexMinus1 > leadingIndex && result[trailingIndexMinus1] === 0) {
      trailingIndexMinus1--;
    }

    result = result.subarray(leadingIndex, trailingIndexMinus1 + 1);
    const roundedDownResult = Core.roundOffDigitsArrayWithTrim(result, lengthLimit);

    if (Comparison.isOneI(roundedDownResult.expAdj)) {
      expAdjustment = Comparison.isZeroI(expAdjustment) ? C.I_1 : C.I_2;
    }

    return {
      result: roundedDownResult.digits,
      expAdjustment: expAdjustment
    };
  }

  /**
   * @param {number[]} a - an array of non-negative integers < BASE
   * @returns {number[]} a * a
   */
  public static square(a: Uint32Array): Uint32Array {
    let result: Uint32Array = new Uint32Array(2 * a.length);
    const lengthMinus1 = a.length - 1;
    let carry: number = 0;

    for (let i = lengthMinus1; i >= 0; i--) {
      for (let j = lengthMinus1; j >= 0; j--) {
        const resultIndex = i + j + 1;
        let digit = (a[i] * a[j]) + carry + result[resultIndex];

        if (digit >= C.BASE) {
          carry = Math.trunc(digit / C.BASE);
          digit = digit % C.BASE;
        } else {
          carry = 0;
        }

        result[resultIndex] = digit;
      }

      if (carry !== 0) {
        result[i] += carry;
        carry = 0;
      }
    }

    if (result[0] === 0 && result.length > 1) {
      result = result.subarray(1);
    }

    return result;
  }

  public static division(
    a: Uint32Array,
    b: Uint32Array
  ): {q: Uint32Array, r: Uint32Array} {
    if (b.length === 1) {
      const result = Longhand.divisionBySingleDigit(a, b[0]);
      return new ArrayDivisionResult(result.q, Uint32Array.of(result.r));
    } else {
      let resultDigits;

      if (b[0] < C.BASE_DIV_2) {
        const scalingFactor = Uint32Array.of(Math.ceil(C.BASE_DIV_2/b[0]));
        resultDigits = Longhand.divisionLoop(
          Longhand.multiplication(scalingFactor, a),
          Longhand.multiplication(scalingFactor, b)
        );
        resultDigits.r = Longhand.divisionBySingleDigit(
          resultDigits.r,
          scalingFactor[0]
        ).q;
      } else {
        resultDigits = Longhand.divisionLoop(a, b);
      }

      return resultDigits;
    }
  }

  /**
   *
   * @param {number[]} a - an array of non-negative integers < BASE
   * @param {number} digit  - a non-negative integer < BASE
   * @returns {{q: number[]; r: number}}
   */
  public static divisionBySingleDigit(
    a: Uint32Array,
    digit: number
  ): {q: Uint32Array, r: number} {
    if (a.length === 1) {
      const quotient = Math.floor(a[0]/digit);
      return {q: Uint32Array.of(quotient), r: a[0] - digit * quotient};
    }

    let q: Uint32Array;
    let startIndex: number;
    const endIndex = a.length - 1;
    let qIndexAdjustment: number;
    let r: number;
    if (digit > a[0]) {
      q = new Uint32Array(a.length - 1);
      r = a[0] * C.BASE;
      startIndex = 1;
      qIndexAdjustment = -1;
    } else {
      q = new Uint32Array(a.length);
      r = 0;
      startIndex = 0;
      qIndexAdjustment = 0;
    }
    let qIndex: number;

    for(let i = startIndex; i < a.length; i++) {
      qIndex = i + qIndexAdjustment;
      r += a[i];

      if (r >= digit) {
        q[qIndex] = Math.trunc(r / digit);
        r = r - (q[qIndex] * digit);
      } else {
        q[qIndex] = 0;
      }

      if (i !== endIndex) {
        r *= C.BASE;
      }
    }

    return {q: q, r: r}
  }


  /**
   * This function assumes that:
   *    0 <= a < BASE^n+1 and (BASE^n)/2 <= b < BASE^n
   * and returns the quotient(floor(a/b)) and the remainder a % b
   */
  public static divSpecialCase(
    a: Uint32Array,
    b: Uint32Array
  ): {q: Uint32Array, r: Uint32Array} {
    const bTimesBASE = Core.scaleArrayByBase(b, 1);
    const invert = Comparison.compareArray(a, bTimesBASE) >= 0;

    if (invert) {
      a = Longhand.subtraction(a, bTimesBASE).result;
    }

    const n = b.length;
    let an: number;
    let anMinus1: number;
    if (a.length > n - 1){
      if (a.length > n) {
        an = a[0];
        anMinus1 = a[1];
      } else {
        an = 0;
        anMinus1 = a[0];
      }
    } else {
      an = 0;
      anMinus1 = 0;
    }

    let q: number = Math.trunc((C.BASE * an + anMinus1)/b[0]);

    if (q > C.BASE_MINUS_ONE) {
      q = C.BASE_MINUS_ONE;
    }

    let test = Longhand.multiplication(Uint32Array.of(q), b);

    if (Comparison.compareArray(test, a) > 0) {
      q--;
      test = Longhand.subtraction(test, b).result;
    }

    if (Comparison.compareArray(test, a) > 0) {
      q--;
      test = Longhand.subtraction(test, b).result;
    }

    return new ArrayDivisionResult(
      invert ? Uint32Array.of(1, q) : Uint32Array.of(q),
      Longhand.subtraction(a, test).result
    );
  }

  public static divisionLoop(
    a: Uint32Array,
    b: Uint32Array
  ): {q: Uint32Array, r: Uint32Array} {
    let x: Uint32Array = a;
    let quotientScaled: Uint32Array = C.ARR_0;
    const result = new ArrayDivisionResult(C.ARR_0, C.ARR_0);
    const bLengthPlus1 = b.length + 1;
    let breakout = false;

    while(!breakout) {
      if (x.length < b.length) {
        quotientScaled = C.ARR_0;
        result.r = x;
        breakout = true;
      } else if (x.length === b.length) {
        if (Comparison.compareArray(x, b) < 0) {
          quotientScaled = C.ARR_0;
          result.r = x;
        } else {
          quotientScaled = C.ARR_1;
          result.r = Longhand.subtraction(x, b).result;
        }
        breakout = true;
      } else if (x.length === b.length + 1) {
        const xDivB = Longhand.divSpecialCase(x, b);
        quotientScaled = xDivB.q;
        result.r = xDivB.r;
        breakout = true;
      } else {
        const splitPoint = x.length - bLengthPlus1;
        const xSplit = Core.splitArray(x, splitPoint);
        const xHi = xSplit.hi;
        const xLo = xSplit.lo;
        const xHiDivB = Longhand.divSpecialCase(xHi, b);
        const xHiDivBRemainderScaled = Core.scaleArrayByBase(xHiDivB.r, splitPoint);
        x = Longhand.addition(xHiDivBRemainderScaled, xLo);
        quotientScaled = Core.scaleArrayByBase(xHiDivB.q, splitPoint);
      }

      result.q = Longhand.addition(result.q, quotientScaled);
    }

    return result;
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      ArrayDivisionResult, C, Core, Comparison,
    ]);
  }
}


// *** imports come at end to avoid circular dependency ***

// interface/type imports
import {int} from "../interfacesAndTypes/int";
import {Class} from "../interfacesAndTypes/Class";


// functional imports
import {ArrayDivisionResult as ArrayDivisionResultAlias}
  from "../dataTypes/ArrayDivisionResult";
const ArrayDivisionResult = ArrayDivisionResultAlias;

import {C as CAlias} from "../constants/C";
const C = CAlias;

import {Core as CoreAlias} from "./Core";
const Core = CoreAlias;

import {Comparison as ComparisonAlias} from "../basicFunctions/Comparison";
const Comparison = ComparisonAlias;
