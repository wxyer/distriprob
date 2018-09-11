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


export class Core {
  public static className: string;

  // constants for adjusting the exponents of numbers
  public static ABS_CHUNK_LIMIT: number;
  public static TWO_TO_ABS_CHUNK_LIMIT: number;
  public static TWO_TO_NEG_ABS_CHUNK_LIMIT: number;


  public static init0(): void {
    Core.className = "Core";

    // constants for adjusting the exponents of numbers
    Core.ABS_CHUNK_LIMIT = 1021;
    Core.TWO_TO_ABS_CHUNK_LIMIT = 2 ** Core.ABS_CHUNK_LIMIT;
    Core.TWO_TO_NEG_ABS_CHUNK_LIMIT = 2 ** (-Core.ABS_CHUNK_LIMIT);
  }

  public static intToNumber(a: int): number {
    if (Comparison.isNaN_I(a)) {
      return NaN;
    } else if (Comparison.isPOSITIVE_INFINITY_I(a)) {
      return Number.POSITIVE_INFINITY;
    } else if (Comparison.isNEGATIVE_INFINITY_I(a)) {
      return Number.NEGATIVE_INFINITY;
    } else {
      let result = 0;
      const maxIter = Math.min(3, a.digits.length);

      for (let i = 0; i < maxIter; i++) {
        result += a.digits[i];
        if (i !== maxIter - 1) {
          result *= C.BASE;
        }
      }

      result = Core.adjustExponent(
        result,
        C.POWER_OF_TWO_FOR_BASE * (a.digits.length - maxIter)
      );

      return a.neg ? -result: result;
    }
  }

  public static numberToInt(num: number): int {
    if (Number.isNaN(num)) {
      return C.NaN;
    } else if (num === Number.POSITIVE_INFINITY) {
      return C.POSITIVE_INFINITY;
    } else if (num === Number.NEGATIVE_INFINITY) {
      return C.NEGATIVE_INFINITY;
    } else {
      return Core.numberToIntUnchecked(num);
    }
  }

  public static numberToIntUnchecked(num: number): int {
    if (num === 0) { return C.I_0;}

    let int = Math.abs(Math.trunc(num));
    const digits: number[] = [];

    while (int >= 1) {
      digits.unshift(int % C.BASE);
      int = Math.trunc(int * C.BASE_RECIPROCAL);
    }

    return new Integer(num < 0, Uint32Array.from(digits));
  }

  public static floatToNumber(x: float): number {
    if (Comparison.isNaN(x)) {
      return NaN;
    } else if (Comparison.isPOSITIVE_INFINITY(x)) {
      return Number.POSITIVE_INFINITY;
    } else if (Comparison.isNEGATIVE_INFINITY(x)) {
      return Number.NEGATIVE_INFINITY;
    } else {
      const coefNum = Core.intToNumber(x.coef);
      const expNum = Core.intToNumber(x.exp);

      if (expNum < -2500) {
        return 0;
      } else if (expNum > 2500) {
        if (coefNum > 0) {
          return Number.POSITIVE_INFINITY;
        } else if (coefNum < 0) {
          return Number.NEGATIVE_INFINITY;
        } else {
          return 0;
        }
      } else {
        return Core.adjustExponent(
          coefNum,
          C.POWER_OF_TWO_FOR_BASE * (expNum - x.coef.digits.length + 1)
        );
      }
    }
  }

  public static numberToFloat(num: number): float {
    if (Number.isNaN(num)) {
      return C.F_NaN;
    } else if (num === Number.POSITIVE_INFINITY) {
      return C.F_POSITIVE_INFINITY;
    } else if (num === Number.NEGATIVE_INFINITY) {
      return C.F_NEGATIVE_INFINITY;
    } else {
      return Core.numberToFloatUnchecked(num);
    }
  }

  public static numberToFloatUnchecked(num: number): float {
    if (num === 0) { return C.F_0; }

    const base2Exp = Math.floor(Math.log2(Math.abs(num)));
    const exp: number = Math.floor(base2Exp / C.POWER_OF_TWO_FOR_BASE);
    let coef: number = Core.adjustExponent(num, -exp * C.POWER_OF_TWO_FOR_BASE);

    while (!Number.isInteger(coef)) {
      coef *= C.BASE;
    }

    return new FloatingPoint(
      Core.numberToIntUnchecked(coef),
      Core.numberToIntUnchecked(exp)
    );
  }

  public static maxF(x: float, y: float): float { return Comparison.gte(x, y) ? x : y; }

  public static minF(x: float, y: float): float { return Comparison.lte(x, y) ? x : y; }

  public static maxI(a: int, b: int): int { return Comparison.gteI(a, b) ? a : b; }

  public static minI(a: int, b: int): int { return Comparison.lteI(a, b) ? a : b; }

  public static adjustExponent(
    x: number,
    offset: number,
  ): number {
    let chunkLimit: number;
    let twoToChunkLimit: number;

    if (offset === 0) {
      return x;
    } else if (offset > 0) {
      chunkLimit = Core.ABS_CHUNK_LIMIT;
      twoToChunkLimit = Core.TWO_TO_ABS_CHUNK_LIMIT;
    } else { // offset < 0
      chunkLimit = -Core.ABS_CHUNK_LIMIT;
      twoToChunkLimit = Core.TWO_TO_NEG_ABS_CHUNK_LIMIT;
    }

    let offsetNumber = x;
    let restOfOffset = offset;
    let twoToChunk: number;
    while (restOfOffset !== 0) {
      if (Math.abs(restOfOffset) >= Core.ABS_CHUNK_LIMIT) {
        twoToChunk = twoToChunkLimit;
        restOfOffset -= chunkLimit;
      } else {
        twoToChunk = Math.pow(2, restOfOffset);
        restOfOffset = 0;
      }

      offsetNumber *= twoToChunk;
    }

    return offsetNumber;
  }

  public static splitArray(
    a: Uint32Array,
    index: number
  ): {hi: Uint32Array, lo: Uint32Array} {
    if (index >= a.length) {
      return new ArraySplit(Uint32Array.of(0), a);
    } else {
      const aLengthMinus1 = a.length - 1;
      const cutoffHi = a.length - index;
      let cutoffLo = cutoffHi;
      // trim leading zeros on lo
      while(a[cutoffLo] === 0 && cutoffLo > aLengthMinus1) { cutoffLo++; }

      return new ArraySplit(a.subarray(0, cutoffHi), a.subarray(cutoffLo));
    }
  }

  public static splitInt(a: int, index: number): {hi: int, lo: int} {
    if (index >= a.digits.length) {
      return new IntegerSplit(C.I_0, a);
    } else {
      const aLengthMinus1 = a.digits.length - 1;
      const cutoffHi = a.digits.length - index;
      let cutoffLo = cutoffHi;
      // trim leading zeros on lo
      while(a[cutoffLo] === 0 && cutoffLo > aLengthMinus1) { cutoffLo++; }

      return new IntegerSplit(
        new Integer(a.neg, a.digits.subarray(0, cutoffHi)),
        new Integer(a.neg, a.digits.subarray(cutoffLo))
      );
    }
  }

  public static roundOffDigits(
    a: int,
    numDigitsToKeep: number,
  ): int {
    if (a.digits.length > numDigitsToKeep) {
      let resultDigits: Uint32Array;

      if (a[numDigitsToKeep] > C.BASE_DIV_2){ // we have rounding to do
        let i = numDigitsToKeep - 1;
        let digit = a[i] + 1;

        while (digit >= C.BASE) {
          i--;
          if (i >= 0) {
            digit = a[i] + 1;
          } else {
            break;
          }
        }

        if (i < 0) {
          resultDigits = new Uint32Array(numDigitsToKeep + 1);
          resultDigits[0] = 1;
        } else if (i !== numDigitsToKeep - 1) {
          resultDigits =  new Uint32Array(numDigitsToKeep);
          resultDigits.set(a.digits.subarray(0, i + 1));
          resultDigits[i]++;
        } else {
          resultDigits  =  a.digits.slice(0, numDigitsToKeep);
        }
      } else {
        resultDigits  =  a.digits.slice(0, numDigitsToKeep);
      }

      return new Integer(a.neg, resultDigits);
    } else {
      return a;
    }
  }


  public static roundOffDigitsArrayWithTrim(
    a: Uint32Array,
    maxNumDigits: number
  ): {digits: Uint32Array, expAdj: int} {
    if (a.length > maxNumDigits) {
      if (a[maxNumDigits] > C.BASE_DIV_2){ // we have rounding to do
        let i = maxNumDigits - 1;
        let digit = a[i] + 1;

        while (digit >= C.BASE) {
          i--;
          if (i >= 0) {
            digit = a[i] + 1;
          } else {
            break;
          }
        }

        if (i < 0) {
          return {digits: C.ARR_1, expAdj: C.I_1};
        } else if (i !== maxNumDigits - 1) {
          const resultDigits = a.slice(0, i + 1);
          resultDigits[i]++;

          return {digits: resultDigits, expAdj: C.I_0};
        }
      }

      const resultDigits = maxNumDigits > 1 && a[maxNumDigits - 1] === 0 ?
        Core.trimTrailing(a.subarray(0, maxNumDigits))
        :
        a.slice(0, maxNumDigits);

      return {
        digits: resultDigits,
        expAdj: C.I_0
      };
    } else {
      return {
        digits: Core.trimTrailing(a),
        expAdj: C.I_0
      }
    }
  }


  public static trimLeading(a: Uint32Array): Uint32Array {
    let beginIndex = 0;

    while (a[beginIndex] === 0 && beginIndex < a.length) {
      beginIndex++;
    }

    if (beginIndex === 0) {
      return a;
    } else {
      return a.slice(beginIndex);
    }
  }

  public static trimTrailing(a: Uint32Array): Uint32Array {
    let endIndex = a.length;

    while(a[endIndex - 1] === 0 && endIndex > 1) {
      endIndex--;
    }

    if (endIndex === a.length) {
      return a;
    } else {
      return a.slice(0, endIndex);
    }
  }

  public static scaleArrayByBase(a: Uint32Array, places): Uint32Array {
    if (a.length === 1 && a[0] === 0) {
      return C.ARR_0;
    } else {
      const result = new Uint32Array(a.length + places);
      result.set(a, 0);
      return result;
    }
  }

  /**
   * This function returns:
   *                    a * (BASE ^ places)
   * @param {int} a
   * @param {number} places
   * @returns {int}
   */
  public static scaleIntByBase(a: int, places: number): int {
    return new Integer(a.neg, Core.scaleArrayByBase(a.digits, places));
  }


  /**
   * This function returns the logarithm of x using the given base
   * @param {number} base
   * @param {number} x
   * @returns {number}
   */
  public static logWithBase(base: number, x: number): number {
    if (base === Math.E) {
      return Math.log(x);
    } else if (base === 2) {
      return Math.log2(x);
    } else if (base === 10) {
      return Math.log10(x);
    } else {
      return Math.log(x) / Math.log(base);
    }
  }

  public static instanceI(x: any): x is int {
    return typeof x === "object" && x !== null
      && Object.prototype.toString.call(x.digits) === "[object Uint32Array]"
      && typeof x.neg === "boolean" && typeof x.type === "number";
  }

  public static instance(x: any): x is float {
    return typeof x === "object" && x !== null && Core.instanceI(x.coef) &&
      Core.instanceI(x.exp);
  }

  public static environmentIsNode(): boolean {
    return typeof module !== 'undefined' && module.exports;
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      Integer, FloatingPoint, IntegerSplit, ArraySplit, C, Comparison
    ]);
  }
}


// *** imports come at end to avoid circular dependency ***

// interface/type imports
import {int} from "../interfacesAndTypes/int";
import {float} from "../interfacesAndTypes/float";
import {Class} from "../interfacesAndTypes/Class";


// functional imports
import {Integer as IntegerAlias} from "../dataTypes/Integer";
const Integer = IntegerAlias;

import {FloatingPoint as FloatingPointAlias} from "../dataTypes/FloatingPoint";
const FloatingPoint = FloatingPointAlias;

import {IntegerSplit as IntegerSplitAlias} from "../dataTypes/IntegerSplit";
const IntegerSplit = IntegerSplitAlias;

import {ArraySplit as ArraySplitAlias} from "../dataTypes/ArraySplit";
const ArraySplit = ArraySplitAlias;

import {C as CAlias} from "../constants/C";
const C = CAlias;

import {Comparison as ComparisonAlias} from "../basicFunctions/Comparison";
const Comparison = ComparisonAlias;



