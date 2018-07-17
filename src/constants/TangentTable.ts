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

import {Integer as IntegerAlias} from "../dataTypes/Integer";
const Integer = IntegerAlias;

import {C as CAlias} from "./C";
const C = CAlias;

import {Longhand as LonghandAlias} from "../core/Longhand";
const Longhand = LonghandAlias;

import {Comparison as ComparisonAlias} from "../basicFunctions/Comparison";
const Comparison = ComparisonAlias;

import {Conversion as ConversionAlias} from "../core/Conversion";
const Conversion = ConversionAlias;

import {FactorialTable as FactorialTableAlias} from "./FactorialTable";
const FactorialTable = FactorialTableAlias;

import {P as PAlias} from "../core/P";
const P = PAlias;
export type P = PAlias;


export class TangentTable {
  public static maxIndex: number;
  private static _Uint32ArrayTable: Array<Uint32Array>;
  private static _intTable: Array<int>;
  private static _fltTable: Array<float>;
  private static _prec: P;

  public static setup(): void {
    if (!FactorialTable._Uint32ArrayTable) { FactorialTable.setup(); }

    TangentTable.maxIndex = Math.min(FactorialTable.maxIndex + 1, 500);
    const digitTable: Array<Uint32Array> = FactorialTable._Uint32ArrayTable.slice(
      0,
      TangentTable.maxIndex
    );

    for (let k = 1; k < TangentTable.maxIndex; k++){
      for (let j = k; j < TangentTable.maxIndex; j++) {
        digitTable[j] = Longhand.addition(
          Longhand.multiplication(Uint32Array.of(j - k), digitTable[j-1]),
          Longhand.multiplication(Uint32Array.of(j - k + 2), digitTable[j])
        );
      }
    }

    TangentTable._Uint32ArrayTable = digitTable;

    TangentTable._intTable = Array(TangentTable.maxIndex + 1).fill(C.I_0);
    TangentTable._fltTable = Array(TangentTable.maxIndex + 1).fill(C.F_0);
    TangentTable._prec
      = P.createPFromNumDigits(digitTable[TangentTable.maxIndex - 1].length);
  }

  public static uint32(n: number): Uint32Array {
    if (!TangentTable._Uint32ArrayTable) { TangentTable.setup(); }

    return TangentTable._Uint32ArrayTable[n - 1];
  }

  public static int(n: number): int {
    if (!TangentTable._Uint32ArrayTable) { TangentTable.setup(); }

    const nMinus1 = n - 1;

    if (Comparison.isZeroI(TangentTable._intTable[nMinus1])) {
      TangentTable._intTable[nMinus1] = new Integer(
        false,
        TangentTable.uint32(n)
      );
    }

    return TangentTable._intTable[nMinus1];
  }

  public static float(n: number): float {
    if (!TangentTable._Uint32ArrayTable) { TangentTable.setup(); }

    const nMinus1 = n - 1;

    if (Comparison.isZero(TangentTable._fltTable[nMinus1])) {
      TangentTable._fltTable[nMinus1] = Conversion.intToFloat(
        TangentTable.int(n),
        TangentTable._prec,
        true
      );
    }

    return TangentTable._fltTable[nMinus1];
  }
}

