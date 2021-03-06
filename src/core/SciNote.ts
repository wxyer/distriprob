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


export class SciNote {
  public static className: string;

  public static init0(): void {
    SciNote.className = "SciNote";
  }

  public static base2Exact(x: float): {c: float, e: float, precC: P, precE: P} {
    const precC = PREC.getPFromBaseDigits(x.coef.digits.length - 1);
    const eInt = Basic.multiplyII(
      Basic.addII(
        x.exp,
        Core.numberToIntUnchecked(1 - x.coef.digits.length)
      ),
      C.POWER_OF_TWO_FOR_BASE_INT
    );
    const precE = PREC.getPFromBaseDigits(eInt.digits.length - 1);

    return {
      c: Conversion.intToFloat(x.coef, precC, true),
      e: Conversion.intToFloat(eInt, precE, true),
      precC: precC,
      precE: precE,
    }
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      C, Core, Basic, Conversion, PREC,
    ]);
  }
}


// *** imports come at end to avoid circular dependency ***

// interface/type imports
import {float} from "../interfacesAndTypes/float";
import {Class} from "../interfacesAndTypes/Class";

import {P as PAlias} from "../dataTypes/P";
export type P = PAlias;


// functional imports
import {C as CAlias} from "../constants/C";
const C = CAlias;

import {Core as CoreAlias} from "./Core";
const Core = CoreAlias;

import {Basic as BasicAlias} from "../basicFunctions/Basic";
const Basic = BasicAlias;

import {Conversion as ConversionAlias} from "./Conversion";
const Conversion = ConversionAlias;

import {PREC as PRECAlias} from "../constants/PREC";
const PREC = PRECAlias;
