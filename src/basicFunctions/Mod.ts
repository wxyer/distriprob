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


export class Mod {
  public static className: string;

  public static init0(): void {
    Mod.className = "Mod";
  }

  public static qAndR(
    x: float,
    y: float,
    type: "euclidean" | "trunc" | "ceil" | "floor" | "round",
    p: P
  ): {quotient: float, remainder: float} {
    const xIsFinite = Comparison.isFinite(x);
    const yIsFinite = Comparison.isFinite(y);

    if (xIsFinite && yIsFinite) {
      if (Comparison.isZero(y)) {
        throw new DomainError(
          Mod.className,
          "qAndR",
          {
            x: {value: x, expectedType: "float"},
            y: {value: y, expectedType: "float"},
            type: {value: type, expectedType: "string"}
          },
          "The mod is undefined if y is 0"
        )
      } else {
        const xDivY = Basic.divideFF(x, y, p);
        let q: float;

        switch(type) {
          case "trunc": q = Conversion.trunc(xDivY); break;
          case "floor": q = Conversion.floor(xDivY); break;
          case "ceil":  q = Conversion.ceil(xDivY); break;
          case "euclidean":
            q =  Comparison.isPositive(y) ?
              Conversion.floor(xDivY)
              :
              Conversion.ceil(xDivY);
            break;
          case "round": q = Conversion.round(xDivY); break;
          default: throw new DomainError(
            Mod.className,
            "qAndR",
            {
              x: {value: x, expectedType: "float"},
              y: {value: y, expectedType: "float"},
              type: {value: type, expectedType: "string"}
            },
            `The type parameter for the float modulo operation must be "euclidean",${""
            } "trunc", "ceil", "floor", or "round"`
          );
        }

        let m = Basic.subtractFF(x, Basic.multiplyFF(q, y, p), p);

        if (Comparison.gte(Sign.absF(m), y)) {
          const recurseResult = Mod.qAndR(m, y, type, p);
          m = recurseResult.remainder;
          q = Basic.addFF(q, recurseResult.quotient, p);
        }

        return new FloatDivisionResult(q, m);
      }
    } else if (Comparison.isNaN(x) || Comparison.isNaN(y)) {
      throw new NaNError(
        Mod.className,
        "qAndR",
        Comparison.isNaN(x) ? "x" : "y"
      );
    } else {
      throw new DomainError(
        Mod.className,
        "qAndR",
        {
          x: {value: x, expectedType: "float"},
          y: {value: y, expectedType: "float"},
          type: {value: type, expectedType: "string"}
        },
        "The mod of x and y is undefined if either are infinite"
      )
    }
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      FloatDivisionResult, Sign, Comparison, Basic, Conversion, NaNError, DomainError,
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
import {FloatDivisionResult as FloatDivisionResultAlias}
from "../dataTypes/FloatDivisionResult";
const FloatDivisionResult = FloatDivisionResultAlias;

import {Sign as SignAlias} from "./Sign";
const Sign = SignAlias;

import {Comparison as ComparisonAlias} from "./Comparison";
const Comparison = ComparisonAlias;

import {Basic as BasicAlias} from "./Basic";
const Basic = BasicAlias;

import {Conversion as ConversionAlias} from "../core/Conversion";
const Conversion = ConversionAlias;

import {NaNError as NaNErrorAlias} from "../errors/NaNError";
const NaNError = NaNErrorAlias;

import {DomainError as DomainErrorAlias} from "../errors/DomainError";
const DomainError = DomainErrorAlias;
