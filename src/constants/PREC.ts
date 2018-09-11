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


import {type} from "os";

type Entry = {
  sqrtEPS: float,
  cbrtEPS: float,
  fourthRootEPS: float,
  truncLogEPSDiv2: float,
  reciprocalSqrtEPS: float,
  oneMinusEPS: float,
  minSafeInt: float,
};


export class PREC {
  public static className: string;
  private static _baseTable: {[baseDigits: number]: Entry};
  private static _binTable: {[binDigits: number]: Entry};
  private static _decTable: {[decDigits: number]: Entry};
  private static _pBaseTable: {[baseDigits: number]: P};
  private static _pBinTable: {[binDigits: number]: P};
  private static _pDecTable: {[decDigits: number]: P};

  public static init0(): void {
    PREC.className = "PREC";
    PREC._baseTable = {};
    PREC._binTable = {};
    PREC._decTable = {};
    PREC._pBaseTable = {};
    PREC._pBinTable = {};
    PREC._pDecTable = {};
  }

  private static createEntry(p: P): Entry {
    const eps = p.epsilon;
    const sqrtEps = Root.squareF(eps, p);
    const cbrtEPS = Root.fn(eps, 3, p);
    const logEPS = Log.f(eps, p);

    const entry: Entry = {
      sqrtEPS: sqrtEps,
      cbrtEPS: Root.fn(eps, 3, p),
      fourthRootEPS: Root.fn(eps, 4, p),
      truncLogEPSDiv2: Conversion.trunc(Basic.divideFF(
        Log.f(eps, p),
        C.F_NEG_2,
        p
      )),
      reciprocalSqrtEPS: Basic.reciprocalF(sqrtEps, p),
      oneMinusEPS: Basic.subtractFF(C.F_1, eps, p),
      minSafeInt: Sign.negateF(p.maxSafeInt),
    };

    if (p.type === "base") {
      PREC._baseTable[p.baseDigits] = entry;
    } else if (p.type === "bin") {
      PREC._binTable[p.binDigits] = entry;
    } else if (p.type === "dec") {
      PREC._decTable[p.decDigits] = entry;
    } else {
      throw PREC.badPTypeError(p);
    }

    return entry;
  }

  private static getEntry(p: P): Entry {
    let entry: Entry | undefined;

    if (p.type === "base") {
      entry = PREC._baseTable[p.baseDigits];
    } else if (p.type === "bin") {
      entry = PREC._binTable[p.binDigits];
    } else if (p.type === "dec") {
      entry = PREC._decTable[p.decDigits];
    } else {
      throw PREC.badPTypeError(p);
    }

    if (typeof entry === "undefined") { entry = PREC.createEntry(p);}

    return entry;
  }

  public static sliceToP(x: float, p: P): float {
    if (x.coef.digits.length > p.baseDigits) {
      return new FloatingPoint(
        new Integer(x.coef.neg, x.coef.digits.slice(0, p.baseDigits)),
        x.exp
      );
    } else {
      return x;
    }
  }

  public static eps(p: P): float { return p.epsilon; }

  public static sqrtEPS(p: P): float { return PREC.getEntry(p).sqrtEPS; }

  public static cbrtEPS(p: P): float { return PREC.getEntry(p).cbrtEPS; }

  public static fourthRootEPS(p: P): float { return PREC.getEntry(p).fourthRootEPS; }

  public static truncLogEPSDiv2(p: P): float { return PREC.getEntry(p).truncLogEPSDiv2; }

  public static reciprocalSqrtEPS(p: P): float {
    return PREC.getEntry(p).reciprocalSqrtEPS;
  }

  public static oneMinusEPS(p: P): float {
    return PREC.getEntry(p).oneMinusEPS;
  }

  public static maxSafeInteger(p: P): float {
    return p.maxSafeInt;
  }

  public static minSafeInteger(p: P): float {
    return PREC.getEntry(p).minSafeInt;
  }

  public static  getPFromBaseDigits(baseDigits: number): P {
    let result: P | undefined = PREC._pBaseTable[baseDigits];

    if (typeof result === "undefined") {
      result = new P(baseDigits, "base");
      PREC._pBaseTable[baseDigits] = result;
    }

    return result;
  }

  public static getPFromBinaryDigits(binaryDigits: number): P {
    let result: P | undefined = PREC._pBinTable[binaryDigits];

    if (typeof result === "undefined") {
      result = new P(binaryDigits, "bin");
      PREC._pBinTable[binaryDigits] = result;
    }

    return result;
  }

  public static getPFromDecimalDigits(decimalDigits: number): P {
    let result: P | undefined = PREC._pDecTable[decimalDigits];

    if (typeof result === "undefined") {
      result = new P(decimalDigits, "dec");
      PREC._pDecTable[decimalDigits] = result;
    }

    return result;
  }

  public static getRelativeP(p: P, relativeBaseDigits: number): P {
    return PREC.getPFromBaseDigits(p.baseDigits - 1 + relativeBaseDigits);
  }

  public static calcDisplayEpsilon(p: P): float {
    if (p.type === "base") {
      return p.epsilon;
    } else if (p.type === "bin") {
      return Pow.fi(C.F_2, Core.numberToIntUnchecked(-p.binDigits), p);
    } else if (p.type === "dec") {
      return Pow.fi(C.F_10, Core.numberToIntUnchecked(-p.decDigits), p);
    } else {
      throw PREC.badPTypeError(p);
    }
  }

  private static calcDisplayMaxSafeInteger(p: P): float {
    if (p.type === "base") {
      return p.maxSafeInt;
    } else if (p.type === "bin") {
      return Basic.subtractFF(
        Pow.fi(C.F_2, Core.numberToIntUnchecked(p.binDigits), p),
        C.F_1,
        p
      );
    } else if (p.type === "dec") {
      return Basic.subtractFF(
        Pow.fi(C.F_10, Core.numberToIntUnchecked(p.decDigits), p),
        C.F_1,
        p
      );
    } else {
      throw PREC.badPTypeError(p);
    }
  }

  private static badPTypeError(p: P): Error {
    return new Error(`P instance type property should be "base", ${""
      }"bin", or "dec", given prec.type = ${(<string>p.type).toString()}`);
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      C, Sign, Core, Basic, Conversion, Pow, Root, Log, P,
    ]);
  }
}


// *** imports come at end to avoid circular dependency ***

import {float} from "../interfacesAndTypes/float";
import {Class} from "../interfacesAndTypes/Class";


// functional imports
import {Integer as IntegerAlias} from "../dataTypes/Integer";
const Integer = IntegerAlias;

import {FloatingPoint as FloatingPointAlias} from "../dataTypes/FloatingPoint";
const FloatingPoint = FloatingPointAlias;

import {C as CAlias} from "./C";
const C = CAlias;

import {Sign as SignAlias} from "../basicFunctions/Sign";
const Sign = SignAlias;

import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;

import {Basic as BasicAlias} from "../basicFunctions/Basic";
const Basic = BasicAlias;

import {Conversion as ConversionAlias} from "../core/Conversion";
const Conversion = ConversionAlias;

import {Pow as PowAlias} from "../basicFunctions/Pow";
const Pow = PowAlias;

import {Root as RootAlias} from "../basicFunctions/Root";
const Root = RootAlias;

import {Log as LogAlias} from "../basicFunctions/Log";
const Log = LogAlias;

import {P as PAlias} from "../dataTypes/P";
const P = PAlias;
export type P = PAlias;