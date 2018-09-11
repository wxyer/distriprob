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


export class Trig {
  public static className: string;
  private static TABLE_SIZE: number;
  private static TABLE_SIZE_TIMES_4: number;
  private static _sin: Array<{ numDigits: number, value: float }>;
  private static _cos: Array<{ numDigits: number, value: float }>;
  private static DIST_FROM_1_CUTOFF: float;
  private static BIG_ATAN_ARG_CUTOFF: float;

  public static init0(): void {
   Trig.className = "Trig";
  }

  public static init1(): void {
    Trig.TABLE_SIZE = 256;
    Trig.TABLE_SIZE_TIMES_4 = Trig.TABLE_SIZE * 4;
    const PI_DIV_TABLE_SIZE_TIMES_4 = Math.PI / Trig.TABLE_SIZE_TIMES_4;
    Trig._sin = Array(Trig.TABLE_SIZE);
    Trig._cos = Array(Trig.TABLE_SIZE);

    Trig._sin[0] = {numDigits: Number.POSITIVE_INFINITY, value: C.F_0};
    Trig._cos[0] = {numDigits: Number.POSITIVE_INFINITY, value: C.F_1};

    for (let i = 1; i <= Trig.TABLE_SIZE; i++) {
      Trig._sin[i] = {
        numDigits: 2,
        value: Core.numberToFloatUnchecked(Math.sin(i * PI_DIV_TABLE_SIZE_TIMES_4))
      };
      Trig._cos[i] = {
        numDigits: 2,
        value: Core.numberToFloatUnchecked(Math.cos(i * PI_DIV_TABLE_SIZE_TIMES_4))
      }
    }

    Trig.DIST_FROM_1_CUTOFF = RATIO.value(
      1,
      100,
      PREC.getPFromBaseDigits(3)
    );
    Trig.BIG_ATAN_ARG_CUTOFF = WHOLE.float(10);
  }

  public static sinF(x: float, p: P): float {
    if (Comparison.isFinite(x)) {
      return Trig.values(x, p).sin;
    } else if (Comparison.isNaN(x)) {
      throw new NaNError(Trig.className, "sinF", "x");
    } else { // x is +/-infinity
      throw new DomainError(
        Trig.className,
        "sinF",
        {x: {value: x, expectedType: "float"}},
        "The sine function is undefined for +/-Infinity."
      );
    }
  }

  public static cosF(x: float, p: P): float {
    if (Comparison.isFinite(x)) {
      return Trig.values(x, p).cos;
    } else if (Comparison.isNaN(x)) {
      throw new NaNError(Trig.className, "cosF", "x");
    } else { // x is +/-infinity
      throw new DomainError(
        Trig.className,
        "cosF",
        {x: {value: x, expectedType: "float"}},
        "The cosine function is undefined for +/-Infinity."
      );
    }
  }

  public static tanF(x: float, p: P): float {
    if (Comparison.isFinite(x)) {
      const vals = Trig.values(x, p);

      if (Comparison.isZero(vals.cos)) {
        throw new DomainError(
          Trig.className,
          "tanF",
          {x: {value: x, expectedType: "float"}},
          `The tangent function is undefined for values that are PI/2 plus an integer${""
          } multiple of PI.`
        )
      }

      return Basic.divideFF(vals.sin, vals.cos, p);
    } else if (Comparison.isNaN(x)) {
      throw new NaNError(Trig.className, "tanF", "x");
    } else { // x is +/-infinity
      throw new DomainError(
        Trig.className,
        "TanF",
        {x: {value: x, expectedType: "float"}},
        "The tangent function is undefined for +/-Infinity."
      );
    }
  }

  public static asinF(x: float, p: P): float {
    if (Comparison.isNaN(x)) {
      throw new NaNError(Trig.className, "asinF", "x");
    } else { // x is finite or +/- infinity
      if (Comparison.lt(x, C.F_NEG_1) || Comparison.gt(x, C.F_1)) {
        throw new DomainError(
          Trig.className,
          "asinF",
          {x: {value: x, expectedType: "float"}},
          "The arcsine function is undefined for values less than -1 or greater than 1."
        );
      } else {
        const distFrom1 = Sign.absF(Basic.decF(Sign.absF(x), p));

        if (Comparison.lt(distFrom1, Trig.DIST_FROM_1_CUTOFF)) {
          // use formula arcsin(x) =  2 * arctan(x/(1 + sqrt(1 - (x^2))))
          const arctanArg = Basic.divideFF(
            x,
            Basic.incF(Root.squareF(Sign.negateF(Powm1.ff(x, C.F_2, p)), p), p),
            p
          );

          const arctan = Trig.atanNewtonsMethodV(arctanArg, p);

          return Basic.multiplyFF(C.F_2, arctan, p);
        } else if (Comparison.lt(Sign.absF(x), p.epsilon)) {
          return x;
        } else {
          return Trig.asinNewtonsMethodV(x, p);
        }
      }
    }
  }

  public static acosF(x: float, p: P): float {
    if (Comparison.isNaN(x)) {
      throw new NaNError(Trig.className, "acosF", "x");
    } else { // x is finite or +/- infinity
      if (Comparison.lt(x, C.F_NEG_1) || Comparison.gtOne(x)) {
        throw new DomainError(
          Trig.className,
          "acosF",
          {x: {value: x, expectedType: "float"}},
          "The arccosine function is undefined for values less than -1 or greater than 1."
        );
      } else if (Comparison.equals(x, C.F_NEG_1)) {
        return PI.value(p);
      } else {
        const distFrom1 = Sign.absF(Basic.decF(Sign.absF(x), p));

        if (Comparison.lt(distFrom1, Trig.DIST_FROM_1_CUTOFF)) {
          // use formula arccos(x) =  2 * arctan(sqrt(1 - (x^2))/(1 + x))
          const arctanArg = Basic.divideFF(
            Root.squareF(Sign.negateF(Powm1.ff(x, C.F_2, p)), p),
            Basic.incF(x, p),
            p
          );

          const arctan = Trig.atanNewtonsMethodV(arctanArg, p);

          return Basic.multiplyFF(C.F_2, arctan, p);
        } else if (Comparison.lt(Sign.absF(x), p.epsilon)) {
          return PI.div(2, p);
        } else {
          return Trig.acosNewtonsMethodV(x, p);
        }
      }
    }
  }

  public static atanF(x: float, p: P): float {
    if (Comparison.isNaN(x)) {
      throw new NaNError(Trig.className, "atanF", "x");
    } else if (Comparison.gt(Sign.absF(x), Trig.BIG_ATAN_ARG_CUTOFF)) {
      const arctanRecipX = Trig.atanF(Basic.reciprocalF(x, p), p);

      if (Comparison.isPositive(x)) {
        // use:  arctan(x) = (PI/2) - arctan(1/x) if x > 0
        if (Comparison.lt(arctanRecipX, p.epsilon)) {
          return PI.div(2, p);
        } else {
          return Basic.subtractFF(PI.div(2, p), arctanRecipX, p);
        }
      } else {
        // use:  arctan(x) = -(PI/2) - arctan(1/x) if x < 0
        if (Comparison.gt(arctanRecipX, p.epsilon)) {
          return PI.div(-2, p);
        } else {
          return Basic.subtractFF(PI.div(-2, p), arctanRecipX, p);
        }
      }
    } else if (Comparison.lt(Sign.absF(x), p.epsilon)) {
      return x;
    } else {
      return Trig.atanNewtonsMethodV(x, p);
    }
  }

  public static atan2FF(y: float, x: float, p: P): float {
    if (Comparison.isNaN(y) || Comparison.isNaN(x)) {
      throw new NaNError(
        Trig.className,
        "atan2",
        Comparison.isNaN(y) ? "y" : "x"
      );
    } else if (Comparison.isPositive(x)) {
      return Trig.atanF(Basic.divideFF(y, x, p), p);
    } else if (Comparison.isPositive(y)) {
      return Basic.subtractFF(
        PI.div(2, p),
        Trig.atanF(Basic.divideFF(x, y, p), p),
        p
      );
    } else if (Comparison.isNegative(y)) {
      return Basic.subtractFF(
        PI.div(-2, p),
        Trig.atanF(Basic.divideFF(x, y, p), p),
        p
      );
    } else if (Comparison.isNegative(x)) {
      return PI.value(p);
    } else {
      return C.F_0;
    }
  }

  private static sinTable(m: number, p: P): float {
    const absM = Math.abs(m);
    const entry = Trig._sin[absM];

    if (p.baseDigits > entry.numDigits) {
      entry.value = Trig.taylorSeriesSin(
        Basic.multiplyFF(
          PI.div(Trig.TABLE_SIZE_TIMES_4, p),
          Core.numberToFloatUnchecked(absM),
          p
        ),
        p
      );
      entry.numDigits = p.baseDigits;
    }

    return m >= 0 ? entry.value : Sign.negateF(entry.value);
  }

  private static cosTable(m: number, p: P): float {
    const absM = Math.abs(m);
    const entry = Trig._cos[absM];

    if (p.baseDigits > entry.numDigits) {
      entry.value = Trig.taylorSeriesCos(
        Basic.multiplyFF(
          PI.div(Trig.TABLE_SIZE_TIMES_4, p),
          Core.numberToFloatUnchecked(m),
          p
        ),
        p
      );
      entry.numDigits = p.baseDigits;
    }

    return entry.value;
  }

  /**
   * The taylor series for the sine function is:
   *      infinity
   *      ----        n   2n + 1
   *      \       (-1) * x
   *       \     ______________
   *       /
   *      /         (2n+1)!
   *      ----
   *      n = 0
   *
   * This function calculates an approximation to this sum.
   */
  public static taylorSeriesSin(x: float, p: P): float {
    if (Comparison.isZero(x)) {
      return C.F_0;
    }

    return Trig.generalTaylorSeries(
      x,
      x,
      n => 2 * n + 1,
      n => (4 * (n ** 2)) + (2 * n),
      p
    );
  }

  /**
   * The taylor series for the cosine function is:
   *      infinity
   *      ----        n   2n
   *      \       (-1) * x
   *       \     ______________
   *       /
   *      /         (2n)!
   *      ----
   *      n = 0
   *
   * This function calculates an approximation to this sum.
   */
  public static taylorSeriesCos(x: float, p: P): float {
    return Trig.generalTaylorSeries(
      x,
      C.F_1,
      n => 2 * n,
      n => (4 * (n ** 2)) - (2 * n),
      p
    );
  }

  private static generalTaylorSeries(
    x: float,
    num: float,
    factItFunction1: (n: number) => number,
    factItFunction2: (n: number) => number,
    p: P
  ): float {
    const approxPrec = PREC.getPFromBaseDigits(3);
    const xSquared = Basic.squareF(x, p);
    let negative = false;
    let sumNum: float = num;
    let sumDenom: float = C.F_1;
    let pow: float = num;
    let termNum: float = num;
    let termDenom: float = C.F_1;
    let sntd: float;
    let sdtn: float;
    let absEpsTimesSNTD: float;
    let n = 0;
    let factIt1: number;
    let keepGoing = true;

    while (keepGoing) {
      n++;
      negative = !negative;
      pow = Basic.multiplyFF(pow, xSquared, p);
      termNum = negative ? Sign.negateF(pow) : pow;

      factIt1 = factItFunction1(n);

      if (factIt1 <= FactorialTable.maxIndex) {
        termDenom = FactorialTable.float(n);
      } else {
        termDenom = Basic.multiplyFF(
          termDenom,
          Core.numberToFloatUnchecked(factItFunction2(n)),
          p
        );
      }

      sntd = Basic.multiplyFF(sumNum, termDenom, p);
      sdtn = Basic.multiplyFF(sumDenom, termNum, p);
      absEpsTimesSNTD = Sign.absF(Basic.multiplyFF(p.epsilon, sntd, approxPrec));

      if (Comparison.gte(absEpsTimesSNTD, Sign.absF(sdtn))) {
        keepGoing = false;
      }

      sumNum = Basic.addFF(sntd, sdtn, p);
      sumDenom = Basic.multiplyFF(sumDenom, termDenom, p);
    }

    return Basic.divideFF(sumNum, sumDenom, p);
  }

  /**
   * This function will find a reduction r of x to the interval [-PI/4, PI/4], and an
   * integer n contained in the set {0, 1, 2, 3} such that:
   *
   *        x = k(PI/2) + r   where k is an integer and
   *        n = k mod 4
   */
  public static modPIDiv2(x: float, p: P): { n: number, r: float } {
    const xExponentNum = Core.intToNumber(x.exp);
    const modPrec = PREC.getPFromBaseDigits(Math.max(
      3,
      (p.baseDigits - 1) * 2 + xExponentNum
    ));

    const y = Basic.multiplyFF(x, PI.reciprocalMul(2, modPrec), modPrec);
    const k = Conversion.floatToInt(y, "round");
    const n = Core.intToNumber(Basic.divideII(k, C.I_4, "euclidean").remainder);
    const f = Basic.subtractFF(
      y,
      Conversion.intToFloat(
        k,
        PREC.getPFromBaseDigits(k.digits.length),
        true),
      modPrec
    );
    const r = Basic.multiplyFF(f, PI.div(2, p), p);

    return {r: r, n: n};
  }

  public static values(x: float, p: P): { sin: float, cos: float } {
    // y is the reduction of a to the range -pi/4 <= y <= pi/4
    let y: float;
    let n: number;

    if (Comparison.lte(Sign.absF(x), PI.div(4, p))) {
      y = x;
      n = 0;
    } else {
      const xModPIDiv2Result = Trig.modPIDiv2(x, p);
      y = xModPIDiv2Result.r;
      n = xModPIDiv2Result.n;
    }

    const yPIDivTABLE_SIZE_TIMES_4Mod = Mod.qAndR(
      y,
      PI.div(Trig.TABLE_SIZE_TIMES_4, p),
      "round",
      p
    );

    const m = Core.floatToNumber(yPIDivTABLE_SIZE_TIMES_4Mod.quotient);//|m| <= TABLE_SIZE
    const z = yPIDivTABLE_SIZE_TIMES_4Mod.remainder;      // |z| <= PI/TABLE_SIZE_TIMES_4

    const sinZ = Trig.taylorSeriesSin(z, p);
    const cosZ = Trig.taylorSeriesCos(z, p);
    const sinV = Trig.sinTable(m, p);
    const cosV = Trig.cosTable(m, p);

    const sinY = Basic.addFF(
      Basic.multiplyFF(sinZ, cosV, p),
      Basic.multiplyFF(cosZ, sinV, p),
      p
    );

    const cosY = Basic.subtractFF(
      Basic.multiplyFF(cosZ, cosV, p),
      Basic.multiplyFF(sinZ, sinV, p),
      p
    );

    if (n === 0) {
      return {
        sin: sinY,
        cos: cosY
      };
    } else if (n === 1) {
      return {
        sin: cosY,
        cos: Sign.negateF(sinY)
      };
    } else if (n === 2) {
      return {
        sin: Sign.negateF(sinY),
        cos: Sign.negateF(cosY)
      };
    } else if (n === 3) {
      return {
        sin: Sign.negateF(cosY),
        cos: sinY
      };
    } else {
      throw new Error(`n = ${n}, it should be 0, 1, 2, or 3`);
    }
  }

  private static getF(
    a: float,
    funct: "sin" | "cos" | "tan",
    p: P
  ): (x: float) => { f0: float, f1: float } {
    return (x: float) => {
      const vals = Trig.values(x, p);
      let f0: float;
      let f1: float;

      if (funct === "sin") {
        f0 = Basic.subtractFF(vals.sin, a, p);
        f1 = vals.cos;
      } else if (funct === "cos") {
        f0 = Basic.subtractFF(vals.cos, a, p);
        f1 = Sign.negateF(vals.sin);
      } else if (funct === "tan") {
        const tanX = Basic.divideFF(vals.sin, vals.cos, p);
        f0 = Basic.subtractFF(tanX, a, p);
        f1 = Basic.addFF(C.F_1, Basic.squareF(tanX, p), p);
      } else {
        throw new Error(`Unrecognized funct type: "${funct
          }", must be "sin", "cos", or "tan"`);
      }

      return {f0: f0, f1: f1};
    };
  }

  private static asinNewtonsMethodV(x: float, p: P): float {
    const f = Trig.getF(x, "sin", p);
    const guess = Comparison.lt(Sign.absF(x), C.F_NUMBER_EPSILON) ?
      x
      :
      Core.numberToFloatUnchecked(Math.asin(Core.floatToNumber(x)));
    const min = PI.div(-2, p);
    const max = PI.div(2, p);

    const root = Roots.newtonRaphsonIterate(
      f,
      guess,
      min,
      max,
      p.quadraticConvergenceSteps,
      p
    );

    return root.result;
  }

  private static acosNewtonsMethodV(x: float, p: P): float {
    const f = Trig.getF(x, "cos", p);
    const guess = Comparison.lt(Sign.absF(x), C.F_NUMBER_EPSILON) ?
      PI.div(2, p)
      :
      Core.numberToFloatUnchecked(Math.acos(Core.floatToNumber(x)));
    const min = C.F_0;
    const max = PI.value(p);
    const root = Roots.newtonRaphsonIterate(
      f,
      guess,
      min,
      max,
      p.quadraticConvergenceSteps,
      p
    );
    return root.result;
  }


  private static atanNewtonsMethodV(x: float, p: P): float {
    const f = Trig.getF(x, "tan", p);
    const guess = Comparison.lt(Sign.absF(x), C.F_NUMBER_EPSILON) ?
      x
      :
      Core.numberToFloatUnchecked(Math.atan(Core.floatToNumber(x)));
    const min = PI.div(-2, p);
    const max = PI.div(2, p);
    const root = Roots.newtonRaphsonIterate(
      f,
      guess,
      min,
      max,
      p.quadraticConvergenceSteps,
      p
    );
    return root.result;
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      C, Sign, Core, Comparison, Basic, Mod, Conversion, PI, FactorialTable, Root,
      Roots, WHOLE, RATIO, Powm1, NaNError, DomainError, PREC,
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

import {NaNError as NaNErrorAlias} from "../errors/NaNError";
const NaNError = NaNErrorAlias;

import {DomainError as DomainErrorAlias} from "../errors/DomainError";
const DomainError = DomainErrorAlias;

import {PREC as PRECAlias} from "../constants/PREC";
const PREC = PRECAlias;