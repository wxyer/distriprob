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


export class C {
  public static className: string;

  // BASE constants
  public static POWER_OF_TWO_FOR_BASE: number;
  public static POWER_OF_TWO_FOR_BASE_INT: int;
  public static POWER_OF_TWO_FOR_BASE_FLOAT: float;
  public static BASE: number;
  public static BASE_INT: int;
  public static BASE_RECIPROCAL;
  public static BASE_MINUS_ONE: number;
  public static BASE_DIV_2;
  public static BASE_DIV_4;
  public static BASE_DIV_8;

  // array constants
  public static ARR_0: Uint32Array;
  public static ARR_1: Uint32Array;
  public static ARR_2: Uint32Array;
  public static ARR_3: Uint32Array;
  public static ARR_4: Uint32Array;
  public static ARR_5: Uint32Array;
  public static ARR_6: Uint32Array;
  public static ARR_7: Uint32Array;
  public static ARR_8: Uint32Array;
  public static ARR_9: Uint32Array;
  public static ARR_10: Uint32Array;
  public static ARR_16: Uint32Array;
  public static ARR_64: Uint32Array;
  public static ARR_256: Uint32Array;
  public static ARR_NUMBER_MAX_SAFE_INTEGER;

  // integer constants
  public static NaN: int;
  public static POSITIVE_INFINITY: int;
  public static NEGATIVE_INFINITY: int;
  public static I_NEG_10: int;
  public static I_NEG_9: int;
  public static I_NEG_8: int;
  public static I_NEG_7: int;
  public static I_NEG_6: int;
  public static I_NEG_5: int;
  public static I_NEG_4: int;
  public static I_NEG_3: int;
  public static I_NEG_2: int;
  public static I_NEG_1: int;
  public static I_0: int;
  public static I_1: int;
  public static I_2: int;
  public static I_3: int;
  public static I_4: int;
  public static I_5: int;
  public static I_6: int;
  public static I_7: int;
  public static I_8: int;
  public static I_9: int;
  public static I_10: int;
  public static I_16: int;
  public static I_64: int;
  public static I_256: int;
  public static NUMBER_MAX_SAFE_INTEGER: int;
  public static NUMBER_MIN_SAFE_INTEGER: int;

  // floating point constants
  public static F_NaN: float;
  public static F_POSITIVE_INFINITY: float;
  public static F_NEGATIVE_INFINITY: float;
  public static F_NEG_10: float;
  public static F_NEG_9: float;
  public static F_NEG_8: float;
  public static F_NEG_7: float;
  public static F_NEG_6: float;
  public static F_NEG_5: float;
  public static F_NEG_4: float;
  public static F_NEG_3: float;
  public static F_NEG_2: float;
  public static F_NEG_1: float;
  public static F_0: float;
  public static F_1: float;
  public static F_2: float;
  public static F_3: float;
  public static F_4: float;
  public static F_5: float;
  public static F_6: float;
  public static F_7: float;
  public static F_8: float;
  public static F_9: float;
  public static F_10: float;
  public static F_16: float;
  public static F_64: float;
  public static F_256: float;
  public static F_NEG_ONE_EIGHTH: float;
  public static F_NEG_ONE_QUARTER: float;
  public static F_NEG_ONE_HALF: float;
  public static F_ONE_HALF: float;
  public static F_ONE_QUARTER: float;
  public static F_ONE_EIGHTH: float;
  public static F_NUMBER_MAX_SAFE_INTEGER: float;
  public static F_NUMBER_MIN_SAFE_INTEGER: float;
  public static F_NUMBER_EPSILON: float;
  public static F_BASE_RECIPROCAL: float;


  public static init0(): void {
    C.className = "C";

    // BASE constants
    C.POWER_OF_TWO_FOR_BASE = 26;
    C.POWER_OF_TWO_FOR_BASE_INT = new Integer(
      false,
      Uint32Array.of(C.POWER_OF_TWO_FOR_BASE)
    );
    C.BASE = 2**C.POWER_OF_TWO_FOR_BASE;
    C.BASE_INT = new Integer(false, Uint32Array.of(1, 0));
    C.BASE_RECIPROCAL = 1/C.BASE;
    C.BASE_MINUS_ONE = C.BASE - 1;
    C.BASE_DIV_2 = C.BASE/2;
    C.BASE_DIV_4 = C.BASE/4;
    C.BASE_DIV_8 = C.BASE/8;

    // array constants
    C.ARR_0 = Uint32Array.of(0);
    C.ARR_1 = Uint32Array.of(1);
    C.ARR_2 = Uint32Array.of(2);
    C.ARR_3 = Uint32Array.of(3);
    C.ARR_4 = Uint32Array.of(4);
    C.ARR_5 = Uint32Array.of(5);
    C.ARR_6 = Uint32Array.of(6);
    C.ARR_7 = Uint32Array.of(7);
    C.ARR_8 = Uint32Array.of(8);
    C.ARR_9 = Uint32Array.of(9);
    C.ARR_10 = Uint32Array.of(10);
    C.ARR_16 = Uint32Array.of(16);
    C.ARR_64 = Uint32Array.of(64);
    C.ARR_256 = Uint32Array.of(256);
    C.ARR_NUMBER_MAX_SAFE_INTEGER = Uint32Array.of(1, 67108863, 67108863);

    // integer Constants
    C.NaN = new Integer(false, intType.NaN);
    C.POSITIVE_INFINITY = new Integer(false, intType.infinite);
    C.NEGATIVE_INFINITY = new Integer(true, intType.infinite);
    C.I_NEG_10 = new Integer(true, C.ARR_10);
    C.I_NEG_9 = new Integer(true, C.ARR_9);
    C.I_NEG_8 = new Integer(true, C.ARR_8);
    C.I_NEG_7 = new Integer(true, C.ARR_7);
    C.I_NEG_6 = new Integer(true, C.ARR_6);
    C.I_NEG_5 = new Integer(true, C.ARR_5);
    C.I_NEG_4 = new Integer(true, C.ARR_4);
    C.I_NEG_3 = new Integer(true, C.ARR_3);
    C.I_NEG_2 = new Integer(true, C.ARR_2);
    C.I_NEG_1 = new Integer(true, C.ARR_1);
    C.I_0 = new Integer(false, C.ARR_0);
    C.I_1 = new Integer(false, C.ARR_1);
    C.I_2 = new Integer(false, C.ARR_2);
    C.I_3 = new Integer(false, C.ARR_3);
    C.I_4 = new Integer(false, C.ARR_4);
    C.I_5 = new Integer(false, C.ARR_5);
    C.I_6 = new Integer(false, C.ARR_6);
    C.I_7 = new Integer(false, C.ARR_7);
    C.I_8 = new Integer(false, C.ARR_8);
    C.I_9 = new Integer(false, C.ARR_9);
    C.I_10 = new Integer(false, C.ARR_10);
    C.I_16 = new Integer(false, C.ARR_16);
    C.I_64 = new Integer(false, C.ARR_64);
    C.I_256 = new Integer(false, C.ARR_256);
    C.NUMBER_MAX_SAFE_INTEGER = new Integer(false, C.ARR_NUMBER_MAX_SAFE_INTEGER);
    C.NUMBER_MIN_SAFE_INTEGER = new Integer(true, C.ARR_NUMBER_MAX_SAFE_INTEGER);

    // floating point constants
    C.F_NaN = new FloatingPoint(C.NaN, C.NaN);
    C.F_POSITIVE_INFINITY = new FloatingPoint(C.POSITIVE_INFINITY, C.POSITIVE_INFINITY);
    C.F_NEGATIVE_INFINITY = new FloatingPoint(C.NEGATIVE_INFINITY, C.POSITIVE_INFINITY);
    C.F_NEG_10 = new FloatingPoint(C.I_NEG_10, C.I_0);
    C.F_NEG_9 = new FloatingPoint(C.I_NEG_9, C.I_0);
    C.F_NEG_8 = new FloatingPoint(C.I_NEG_8, C.I_0);
    C.F_NEG_7 = new FloatingPoint(C.I_NEG_7, C.I_0);
    C.F_NEG_6 = new FloatingPoint(C.I_NEG_6, C.I_0);
    C.F_NEG_5 = new FloatingPoint(C.I_NEG_5, C.I_0);
    C.F_NEG_4 = new FloatingPoint(C.I_NEG_4, C.I_0);
    C.F_NEG_3 = new FloatingPoint(C.I_NEG_3, C.I_0);
    C.F_NEG_2 = new FloatingPoint(C.I_NEG_2, C.I_0);
    C.F_NEG_1 = new FloatingPoint(C.I_NEG_1, C.I_0);
    C.F_0 = new FloatingPoint(C.I_0, C.I_0);
    C.F_1 = new FloatingPoint(C.I_1, C.I_0);
    C.F_2 = new FloatingPoint(C.I_2, C.I_0);
    C.F_3 = new FloatingPoint(C.I_3, C.I_0);
    C.F_4 = new FloatingPoint(C.I_4, C.I_0);
    C.F_5 = new FloatingPoint(C.I_5, C.I_0);
    C.F_6 = new FloatingPoint(C.I_6, C.I_0);
    C.F_7 = new FloatingPoint(C.I_7, C.I_0);
    C.F_8 = new FloatingPoint(C.I_8, C.I_0);
    C.F_9 = new FloatingPoint(C.I_9, C.I_0);
    C.F_10 = new FloatingPoint(C.I_10, C.I_0);
    C.F_16 = new FloatingPoint(C.I_16, C.I_0);
    C.F_64 = new FloatingPoint(C.I_64, C.I_0);
    C.F_256 = new FloatingPoint(C.I_256, C.I_0);
    C.F_NEG_ONE_EIGHTH = new FloatingPoint(
      new Integer(true, Uint32Array.of(C.BASE_DIV_8)),
      C.I_NEG_1
    );
    C.F_NEG_ONE_QUARTER = new FloatingPoint(
      new Integer(true, Uint32Array.of(C.BASE_DIV_4)),
      C.I_NEG_1
    );
    C.F_NEG_ONE_HALF = new FloatingPoint(
      new Integer(true, Uint32Array.of(C.BASE_DIV_2)),
      C.I_NEG_1
    );
    C.F_ONE_HALF = new FloatingPoint(
      new Integer(false, Uint32Array.of(C.BASE_DIV_2)),
      C.I_NEG_1
    );
    C.F_ONE_QUARTER = new FloatingPoint(
      new Integer(false, Uint32Array.of(C.BASE_DIV_4)),
      C.I_NEG_1
    );
    C.F_ONE_EIGHTH = new FloatingPoint(
      new Integer(false, Uint32Array.of(C.BASE_DIV_8)),
      C.I_NEG_1
    );
    C.F_NUMBER_MAX_SAFE_INTEGER = new FloatingPoint(C.NUMBER_MAX_SAFE_INTEGER, C.I_2);
    C.F_NUMBER_MIN_SAFE_INTEGER = new FloatingPoint(C.NUMBER_MIN_SAFE_INTEGER, C.I_2);
    C.F_NUMBER_EPSILON = new FloatingPoint(C.I_1, C.I_NEG_2);
    C.F_BASE_RECIPROCAL = new FloatingPoint(C.I_1, C.I_NEG_1);
    C.POWER_OF_TWO_FOR_BASE_FLOAT = new FloatingPoint(
      C.POWER_OF_TWO_FOR_BASE_INT,
      C.I_0
    );
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      Integer, FloatingPoint,
    ]);
  }
}


// *** imports come at end to avoid circular dependency ***

// interface/type imports
import {int, intType} from "../interfacesAndTypes/int";
import {float} from "../interfacesAndTypes/float";
import {Class} from "../interfacesAndTypes/Class";


// functional imports
import {Integer as IntegerAlias} from "../dataTypes/Integer";
const Integer = IntegerAlias;

import {FloatingPoint as FloatingPointAlias} from "../dataTypes/FloatingPoint";
const FloatingPoint = FloatingPointAlias;

