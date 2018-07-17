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

import {C as CAlias} from "./C";
const C = CAlias;

import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;

import {Basic as BasicAlias} from "../basicFunctions/Basic";
const Basic = BasicAlias;

import {Exp as ExpAlias} from "../basicFunctions/Exp";
const Exp = ExpAlias;

import {P as PAlias} from "../core/P";
export type P = PAlias;


export class OMEGA {
  private static _initialGuess: float;
  private static _value: float;
  private static _numDigits: number;

  public static value(prec: P): float {
    if (typeof OMEGA._numDigits === "undefined" || OMEGA._numDigits < prec.numDigits) {
      OMEGA._value = OMEGA.calculate(prec);
      OMEGA._numDigits = prec.numDigits;
    }

    return OMEGA._value;
  }

  private static calculate(prec: P): float {
    if (typeof OMEGA._initialGuess === "undefined") {
      OMEGA._initialGuess = Core.numberToFloatUnchecked(0.567143290409783873);
    }

    const iterations = prec.quadraticConvergenceSteps;
    let val = OMEGA._initialGuess;

    console.log("iterations:", iterations);

    for(let i = 1; i <= iterations; i++) {
      val = Basic.divideFF(
        Basic.addFF(C.F_1, val, prec),
        Basic.addFF(C.F_1, Exp.f(val, prec), prec),
        prec
      );
    }

    return val;
  }
}
