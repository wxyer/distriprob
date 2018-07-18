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

import {C as CAlias} from "../constants/C";
const C = CAlias;

import {Sign as SignAlias} from "./Sign";
const Sign = SignAlias;

import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;

import {Comparison as ComparisonAlias} from "./Comparison";
const Comparison = ComparisonAlias;

import {Basic as BasicAlias} from "./Basic";
const Basic = BasicAlias;

import {Mod as ModAlias} from "./Mod";
const Mod = ModAlias;

import {Conversion as ConversionAlias} from "../core/Conversion";
const Conversion = ConversionAlias;

import {PI as PIAlias} from "../constants/PI";
const PI = PIAlias;

import {FactorialTable as FactorialTableAlias} from "../constants/FactorialTable";
const FactorialTable = FactorialTableAlias;

import {Exp as ExpAlias} from "./Exp";
const Exp = ExpAlias;

import {Root as RootAlias} from "./Root";
const Root = RootAlias;

import {Roots as RootsAlias} from "../boostPorts/tools/roots";
const Roots = RootsAlias;

import {WHOLE as WHOLEAlias} from "../constants/WHOLE";
const WHOLE = WHOLEAlias;

import {RATIO as RATIOAlias} from "../constants/RATIO";
const RATIO = RATIOAlias;

import {Powm1 as Powm1Alias} from "../boostPorts/special_functions/powm1";
const Powm1 = Powm1Alias;

import {P as PAlias} from "../core/P";
const P = PAlias;
export type P = PAlias;

export class Hybol {
  // // class constants
  public static SMALL_ARG_CUTOFF: float;

  public static setup(): void {
    Hybol.SMALL_ARG_CUTOFF = RATIO.value(
      1,
      100,
      P.createPFromNumDigits(3)
    );
  }

  private static taylorSeriesSinh(x: float, prec: P): float {
    const xSquared = Basic.squareF(x, prec);
    let termNum = x;
    let termDenom = C.F_1;
    let fact = {value: C.F_1, index: 1, nextIndex: 3};
    let sumNum =  termNum;
    let sumDenom = termDenom;
    let sntd: float;
    let sdtn: float;
    let absEpsTimesSNTD: float;
    let keepGoing = true;

    while(keepGoing) {
      termNum = Basic.multiplyFF(termNum, xSquared, prec);
      fact.nextIndex = fact.index + 2;
      FactorialTable.calcFact(fact, prec);
      termDenom = fact.value;

      sntd = Basic.multiplyFF(sumNum, termDenom, prec);
      sdtn = Basic.multiplyFF(sumDenom, termNum, prec);
      absEpsTimesSNTD = Sign.absF(Basic.multiplyFF(prec.epsilon, sntd, prec));

      if (Comparison.gte(absEpsTimesSNTD, Sign.absF(sdtn))) { keepGoing = false; }

      sumNum = Basic.addFF(sntd, sdtn, prec);
      sumDenom = Basic.multiplyFF(sumDenom, termDenom, prec);
    }

    return Basic.divideFF(sumNum, sumDenom, prec);
  }

  /**
   * uses the formula for sinh(x):
   *
   *             exp(x) - exp(-x)
   * sinh(x) =  ------------------
   *                    2
   */
  private static sinhFromExpV(x: float, prec: P): float {
    const expX = Exp.f(x, prec);
    const expNegX = Basic.reciprocalF(expX, prec);

    return Basic.multiplyFF(C.F_ONE_HALF, Basic.subtractFF(expX, expNegX, prec), prec);
  }

  /**
   * uses the formula for cosh(x):
   *
   *            exp(x) + exp(-x)
   * cosh(x) = ------------------
   *                   2
   */
  private static coshFromExpV(x: float, prec: P): float {
    const expX = Exp.f(x, prec);
    const expNegX = Basic.reciprocalF(expX, prec);

    return Basic.multiplyFF(C.F_ONE_HALF, Basic.addFF(expX, expNegX, prec), prec);
  }

  /**
   * uses the formula for tanh(x):
   *
   *            1 - exp(-2x)
   * tanh(x) = --------------
   *            1 + exp(-2x)
   */
  private static tanhFromExpV(x: float, prec: P): float {
    const expNeg2X = Exp.f(Basic.multiplyFF(C.F_NEG_2, x, prec), prec);

    if (Comparison.lt(expNeg2X, prec.epsilon)) {
      return C.F_1;
    } else if (Comparison.gt(expNeg2X, prec.maxSafeInt)) {
      return C.F_NEG_1;
    } else {
      return Basic.divideFF(
        Basic.subtractFF(C.F_1, expNeg2X, prec),
        Basic.addFF(C.F_1, expNeg2X, prec),
        prec
      );
    }
  }

  public static sinhV(x: float, prec: P): float {
    if (Comparison.isPOSITIVE_INFINITY(x)) {
      return C.F_POSITIVE_INFINITY;
    } else if (Comparison.isNEGATIVE_INFINITY(x)) {
      return C.F_NEGATIVE_INFINITY;
    } else if (Comparison.lte(Sign.absF(x), Hybol.SMALL_ARG_CUTOFF)) {
      return Hybol.taylorSeriesSinh(x, prec);
    } else {
      return Hybol.sinhFromExpV(x, prec);
    }
  }

  public static coshV(x: float, prec: P): float {
    if (Comparison.isPOSITIVE_INFINITY(x) || Comparison.isNEGATIVE_INFINITY(x)) {
      return C.F_POSITIVE_INFINITY;
    } else {
      return Hybol.coshFromExpV(x, prec);
    }
  }

  public static tanhV(x: float, prec: P): float {
    if (Comparison.lte(Sign.absF(x), Hybol.SMALL_ARG_CUTOFF)) {
      const sinh = Hybol.taylorSeriesSinh(x, prec);
      const cosh = Hybol.coshFromExpV(x, prec);
      return Basic.divideFF(sinh, cosh, prec);
    } else {
      return Hybol.tanhFromExpV(x, prec);
    }
  }

  public static acoshV(x: float, prec: P): float {
    return Hybol.Acosh.vImp(x);
  }

  public static asinhV(x: float, prec: P): float {
    return Hybol.Asinh.vImp(x);
  }

  public static atanhV(x: float, prec: P): float {
    return Hybol.Atanh.vImp(x);
  }
}

