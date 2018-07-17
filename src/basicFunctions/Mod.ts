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

import {Sign as SignAlias} from "./Sign";
const Sign = SignAlias;

import {Comparison as ComparisonAlias} from "./Comparison";
const Comparison = ComparisonAlias;

import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;

import {P as PAlias} from "../core/P";
const P = PAlias;
export type P = PAlias;

import {Basic as BasicAlias} from "./Basic";
const Basic = BasicAlias;

import {Conversion as ConversionAlias} from "../core/Conversion";
const Conversion = ConversionAlias;

export class Mod {
  public static qAndR(
    x: float,
    y: float,
    type: "euclidean" | "trunc" | "ceil" | "floor" | "round" = "trunc",
    prec: P
  ): {q: float, r: float} {
    const xDivY = Basic.divideFF(x, y, prec);
    let q: float;

    switch(type) {
      case "trunc": q = Conversion.trunc(xDivY); break;
      case "floor": q = Conversion.floor(xDivY); break;
      case "ceil":  q = Conversion.ceil(xDivY); break;
      case "euclidean":
        q =  Comparison.isPositive(y) ? Conversion.floor(xDivY) : Conversion.ceil(xDivY);
        break;
      case "round": q = Conversion.round(xDivY); break;
      default: throw new Error(`type "${type}", not recognized`);
    }

    let m = Basic.subtractFF(x, Basic.multiplyFF(q, y, prec), prec);

    if (Comparison.gte(Sign.absF(m), y)) {
      const recurseResult = Mod.qAndR(m, y, type, prec);
      m = recurseResult.r;
      q = Basic.addFF(q, recurseResult.q, prec);
    }

    return {q: q, r: m};
  }

}
