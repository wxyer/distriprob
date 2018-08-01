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

import {Integer} from "../dataTypes/Integer";
import {FloatingPoint} from "../dataTypes/FloatingPoint";

import {C as CAlias} from "./C";
const C = CAlias;

import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;


type Entry = {
  arr: Uint32Array,
  posInt: int,
  negInt: int,
  posFloat: float,
  negFloat: float
};


export class WHOLE {
  private static _table: {[n: number]: Entry};

  public static init0(): void {
    WHOLE._table = {};
  }

  public static arr(n: number): Uint32Array {
    return WHOLE.getEntry(n).arr;
  }

  public static int(n: number): int {
    const entry = WHOLE.getEntry(n);

    return n < 0 ? entry.negInt : entry.posInt;
  }

  public static float(n: number): float {
    const entry = WHOLE.getEntry(n);

    return n < 0 ? entry.negFloat : entry.posFloat;
  }

  private static getEntry(n: number): Entry {
    if (n < 0) { n = -n; }

    let entry = WHOLE._table[n];

    if (typeof entry === "undefined") {
      let arr: Uint32Array;
      let posInt: int;
      let negInt: int;
      let posFloat: float;
      let negFloat: float;

      if (n < C.BASE) {
        arr = Uint32Array.of(n);
        posInt = new Integer(false, arr);
        negInt = new Integer(true, arr);
        posFloat = new FloatingPoint(posInt, C.I_0);
        negFloat = new FloatingPoint(negInt, C.I_0);
      } else {
        posInt = Core.numberToIntUnchecked(n);
        arr = posInt.digits;
        negInt = new Integer(true, arr);
        posFloat = Core.numberToFloatUnchecked(n);
        negFloat = Core.numberToFloatUnchecked(-n);
      }

      entry = {
        arr: arr,
        posInt: posInt,
        negInt: negInt,
        posFloat: posFloat,
        negFloat: negFloat,
      };
      WHOLE._table[n] = entry;
    }

    return entry;
  }
}

