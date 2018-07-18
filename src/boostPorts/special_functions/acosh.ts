"use strict";

/**
 * (C) Copyright Eric Ford & Hubert Holin 2001.
 * (C) Copyright John Maddock 2008.
 * (C) Copyright Zachary Martin 2018 (port to javascript).
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

import {float} from "../../interfaces/float";

import {C as CAlias} from "../../constants/C";
const C = CAlias;

import {Basic as BasicAlias} from "../../basicFunctions/Basic";
const Basic = BasicAlias;

import {Comparison as ComparisonAlias} from "../../basicFunctions/Comparison";
const Comparison = ComparisonAlias;

import {EPSILON as EPSILONAlias} from "../../constants/EPSILON";
const EPSILON = EPSILONAlias;

import {WHOLE as WHOLEAlias} from "../../constants/WHOLE";
const WHOLE = WHOLEAlias;

import {RATIO as RATIOAlias} from "../../constants/RATIO";
const RATIO = RATIOAlias;

import {Root as RootAlias} from "../../basicFunctions/Root";
const Root = RootAlias;

import {Log as LogAlias} from "../../basicFunctions/Log";
const Log = LogAlias;

import {LN2 as LN2Alias} from "../../constants/LN2";
const LN2 = LN2Alias;

import {StringWriter as StringWriterAlias} from "../../core/StringWriter";
const StringWriter = StringWriterAlias;

import {P as PAlias} from "../../core/P";
const P = PAlias;
export type P = PAlias;

export class Acosh {

  public static imp(x: float, prec: P): float {
    if (Comparison.ltOne(x)) {
      throw new Error(`acosh function requires argument >= 1, got: ${
        StringWriter.toStr(x)}`);
    }

    const y = Basic.subtractFF(x, C.F_1, prec);

    if (Comparison.gte(y, prec.epsilon)) {
      if (Comparison.gt(x, EPSILON.reciprocalSqrt(prec))) {
        // approximation by laurent series in 1/x at 0+ order from -1 to 0
        return  Basic.addFF(Log.f(x, prec), LN2.value(prec), prec);

      } else if (Comparison.lt(x, RATIO.value(3, 2, prec))) {
        // This is just a rearrangement of the standard form below
        // devised to minimize loss of precision when x ~ 1:
        // return log1p(y + sqrt(y * y + 2 * y))
        return Log.onePlusF(Basic.addFF(
          y,
          Root.squareF(Basic.addFF(
            Basic.squareF(y, prec),
            Basic.multiplyFF(C.F_2, y, prec),
            prec
          ), prec),
          prec
        ), prec);
      } else {
        // return log( x + sqrt(x * x - 1) )
        return Log.f(Basic.addFF(
          x,
          Root.squareF(Basic.subtractFF(Basic.squareF(x, prec), C.F_1, prec), prec),
          prec
        ), prec);

      }
    } else {
      // approximation by taylor series in y at 0 up to order 2
      // return sqrt(2 * y) * (1 - y /12 + 3 * y * y / 160)
      const sqrt2y = Root.squareF(Basic.multiplyFF(C.F_2, y, prec), prec);
      const yDiv12 = Basic.divideFF(y, WHOLE.float(12), prec);
      const threeYSquaredDiv160 = Basic.divideFF(
        Basic.multiplyFF(C.F_3, Basic.squareF(y, prec), prec),
        WHOLE.float(160),
        prec
      );
      const b = Basic.subtractFF(C.F_1, yDiv12, prec);
      const c = Basic.addFF(b, threeYSquaredDiv160, prec);

      return Basic.multiplyFF(sqrt2y, c, prec);
    }
  }
}

