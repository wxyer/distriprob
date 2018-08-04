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
 * This class calculates the Euler-Mascheroni constant to the desired precision. It uses
 * the Brent McMillan algorithm to do so, as described in the article:
 *
 *  "Some new algorithms for high-precision computation of Euler's constant" in the AMS
 *  journal of Mathematics of Computation; January, 1980, volume 34, number 149;
 *  pp. 305 - 312
 */
export class EULMASC {
  private static _value: float;
  private static _baseDigits: number;

  public static value(p: P): float {
    if (typeof EULMASC._baseDigits === "undefined" || EULMASC._baseDigits < p.baseDigits){
      EULMASC._value = EULMASC.calculate(p);
      EULMASC._baseDigits = p.baseDigits;
    }

    return EULMASC._value;
  }

  private static calculate(p: P): float {
    const n = Math.floor(
      1 + 0.25 * Math.log(2) * C.POWER_OF_TWO_FOR_BASE * p.baseDigits
    );
    const nFloat = Core.numberToFloatUnchecked(n);
    const nSquared = Basic.squareF(nFloat, p);
    const limit = Math.ceil(3.6 * n);

    let aNum = Sign.negateF(Log.f(nFloat, p));
    let aDenom = C.F_1;
    let bNum = C.F_1;
    let bDenom = C.F_1;
    let uNum = aNum;
    let uDenom = aDenom;
    let vNum = bNum;
    let vDenom = bDenom;
    let aNumTimesNSquared: float;
    let aDenomTimesK: float;
    let kFloat: float;
    let kSquared: float;


    for(let k = 1; k <= limit; k++) {
      kFloat = Core.numberToFloatUnchecked(k);
      kSquared = Basic.squareF(kFloat, p);

      bNum = Basic.multiplyFF(bNum, nSquared, p);
      bDenom = Basic.multiplyFF(bDenom, kSquared, p);

      aNumTimesNSquared = Basic.multiplyFF(aNum, nSquared, p);
      aDenomTimesK = Basic.multiplyFF(aDenom, kFloat, p);
      aNum = Basic.addFF(
        Basic.multiplyFF(aNumTimesNSquared, bDenom, p),
        Basic.multiplyFF(aDenomTimesK, bNum, p),
        p
      );
      aDenom = Basic.multiplyFF(
        Basic.multiplyFF(aDenomTimesK, bDenom, p),
        kFloat,
        p
      );

      uNum = Basic.addFF(
        Basic.multiplyFF(uNum, aDenom, p),
        Basic.multiplyFF(uDenom, aNum, p),
        p
      );
      uDenom = Basic.multiplyFF(uDenom, aDenom, p);

      vNum = Basic.addFF(
        Basic.multiplyFF(vNum, bDenom, p),
        Basic.multiplyFF(vDenom, bNum, p),
        p
      );
      vDenom = Basic.multiplyFF(vDenom, bDenom, p);
    }

    return Basic.divideFF(
      Basic.multiplyFF(uNum, vDenom, p),
      Basic.multiplyFF(uDenom, vNum, p),
      p
    )
  }
}


// *** imports come at end to avoid circular dependency ***

import {float} from "../interfaces/float";

import {C as CAlias} from "./C";
const C = CAlias;

import {Sign as SignAlias} from "../basicFunctions/Sign";
const Sign = SignAlias;

import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;

import {Basic as BasicAlias} from "../basicFunctions/Basic";
const Basic = BasicAlias;

import {Log as LogAlias} from "../basicFunctions/Log";
const Log = LogAlias;

import {P as PAlias} from "../dataTypes/P";
export type P = PAlias;

