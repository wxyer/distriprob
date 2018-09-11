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


export class Basic {
  public static className: string;

  public static init0(): void {
    Basic.className = "Basic";
  }

  public static init1(): void {
    Library.registerInternalFunctions(
      Basic,
      [
        {
          name: "addII",
          funct: Basic.addII,
          params: [{type: "int", name: "a"}, {type: "int", name: "b"}],
          returnType: "int",
          relPrec: 0
        },
        {
          name: "incI",
          funct: Basic.incI,
          params: [{type: "int", name: "a"}],
          returnType: "int",
          relPrec: 0
        },
        {
          name: "decI",
          funct: Basic.decI,
          params: [{type: "int", name: "a"}],
          returnType: "int",
          relPrec: 0
        },
        {
          name: "subtractII",
          funct: Basic.subtractII,
          params: [{type: "int", name: "a"}, {type: "int", name: "b"}],
          returnType: "int",
          relPrec: 0
        },
        {
          name: "multiplyII",
          funct: Basic.multiplyII,
          params: [{type: "int", name: "a"}, {type: "int", name: "b"}],
          returnType: "int",
          relPrec: 0
        },
        {
          name: "squareI",
          funct: Basic.squareI,
          params: [{type: "int", name: "a"}],
          returnType: "int",
          relPrec: 0
        },
        {
          name: "divideII",
          funct: Basic.divideII,
          params: [
            {type: "int", name: "a"},
            {type: "int", name: "b"},
            {
              type: "string",
              name: "type",
              acceptableValues: ["euclidean", "trunc", "ceil", "floor", "round"],
              default: "euclidean"
            }
            ],
          returnType: "IntDivResult",
          relPrec: 0
        },
        {
          name: "addFF",
          funct: Basic.addFF,
          params: [
            {type: "float", name: "x"},
            {type: "float", name: "y"},
            {type: "P", name: "p"}
            ],
          returnType: "float",
          relPrec: 0
        },
        {
          name: "incF",
          funct: Basic.incF,
          params: [{type: "float", name: "x"}, {type: "P", name: "p"}],
          returnType: "float",
          relPrec: 0
        },
        {
          name: "decF",
          funct: Basic.decF,
          params: [{type: "float", name: "x"}, {type: "P", name: "p"}],
          returnType: "float",
          relPrec: 0
        },
        {
          name: "subtractFF",
          funct: Basic.subtractFF,
          params: [
            {type: "float", name: "x"},
            {type: "float", name: "y"},
            {type: "P", name: "p"}
            ],
          returnType: "float",
          relPrec: 0
        },
        {
          name: "multiplyFF",
          funct: Basic.multiplyFF,
          params: [
            {type: "float", name: "x"},
            {type: "float", name: "y"},
            {type: "P", name: "p"}
          ],
          returnType: "float",
          relPrec: 0
        },
        {
          name: "squareF",
          funct: Basic.squareF,
          params: [{type: "float", name: "x"}, {type: "P", name: "p"}],
          returnType: "float",
          relPrec: 0
        },
        {
          name: "reciprocalF",
          funct: Basic.reciprocalF,
          params: [{type: "float", name: "x"}, {type: "P", name: "p"}],
          returnType: "float",
          relPrec: 0
        },
        {
          name: "divideFF",
          funct: Basic.divideFF,
          params: [
            {type: "float", name: "x"},
            {type: "float", name: "y"},
            {type: "P", name: "p"}
          ],
          returnType: "float",
          relPrec: 0
        },
      ]
    );
  }

  // ********************* integer functions ************************************

  public static addII(a: int, b: int): int {
    const aIsFinite = Comparison.isFiniteI(a);
    const bIsFinite = Comparison.isFiniteI(b);

    if (aIsFinite && bIsFinite) {
      if (a.digits.length === 1 && b.digits.length === 1) {
        const sum = (a.neg ? - a.digits[0] : a.digits[0]) +
          (b.neg ? -b.digits[0] : b.digits[0]);
        const absSum = Math.abs(sum);

        if (absSum < C.BASE) {
          return new Integer(sum < 0, Uint32Array.of(absSum))
        } else {
          return Core.numberToIntUnchecked(sum);
        }
      }

      let resultDigits: Uint32Array;
      let negative: boolean;


      if (a.neg === b.neg) {
        negative = a.neg;
        resultDigits = Longhand.addition(a.digits, b.digits);
      } else {
        const sub = Longhand.subtraction(a.digits, b.digits);

        if (sub.aGTEb) {
          negative = a.neg;
        } else if (sub.result.length === 1 && sub.result[0] === 0) {
          return C.I_0;
        } else {
          negative = b.neg;
        }

        resultDigits = sub.result;
      }

      return new Integer(negative, resultDigits);

    } else {
      if (Comparison.isNaN_I(a) || Comparison.isNaN_I(b)) {
        throw new NaNError(
          Basic.className,
          "addII",
          Comparison.isNaN_I(a) ? "a" : "b"
        );
      } else if (aIsFinite) {   // b must be +/- infinity
        return b;
      } else if (bIsFinite) {  // a must be +/- infinity
        return a;
      } else { // both a and b are +/- infinity
        const sameSign = Comparison.isNegativeI(a) === Comparison.isNegativeI(b);

        if (sameSign) {
          return a;
        } else {
          throw new DomainError(
            Basic.className,
            "addII",
            {
              a: {value: a, expectedType: "int"},
              b: {value: b, expectedType: "int"}
            },
            "The sum of positive and negative infinity is undefined in integer addition."
          );
        }
      }
    }
  }

  public static incI(a: int): int { return Basic.addII(a, C.I_1); }

  public static decI(a: int): int { return Basic.addII(a, C.I_NEG_1); }

  public static subtractII(a: int, b: int): int {
    const aIsFinite = Comparison.isFiniteI(a);
    const bIsFinite = Comparison.isFiniteI(b);
    const aIsNaN = Comparison.isNaN_I(a);
    const bIsNaN = Comparison.isNaN_I(b);

    if ((aIsFinite && !bIsNaN) || (bIsFinite && !aIsNaN)) {
      return Basic.addII(a, Sign.negateI(b));
    } else if (aIsNaN || bIsNaN) {
      throw new NaNError(
        Basic.className,
        "subtractII",
        Comparison.isNaN_I(a) ? "a" : "b"
      );
    } else { // both a and b are +/- infinity
      const differentSign = Comparison.isNegativeI(a) !== Comparison.isNegativeI(b);

      if (differentSign) {
        return a;
      } else {
        throw new DomainError(
          Basic.className,
          "subtractII",
          {
            a: {value: a, expectedType: "int"},
            b: {value: b, expectedType: "int"}
          },
          `The difference of infinite values of the same sign is undefined in integer${""
          } subtraction.`
        );
      }
    }
  }

  public static multiplyII(a: int, b: int): int {
    if (Comparison.isFiniteI(a) && Comparison.isFiniteI(b)) {
      if (a.digits.length === 1 && b.digits.length === 1) {
        const absProduct = a.digits[0] * b.digits[0];
        const product = a.neg === b.neg ? absProduct : -1 * absProduct ;

        if (absProduct < C.BASE) {
          return new Integer(product < 0, Uint32Array.of(absProduct))
        } else {
          return Core.numberToIntUnchecked(product);
        }
      } else {
        return Basic.karatsuba(a, b);
      }
    } else if (Comparison.isNaN_I(a) || Comparison.isNaN_I(b)){
      throw new NaNError(
        Basic.className,
        "multiplyII",
        Comparison.isNaN_I(a) ? "a" : "b"
      );
    } else if (Comparison.isZeroI(a) || Comparison.isZeroI(b)){
      // one is 0 and the other is +/- infinity
      throw new DomainError(
        Basic.className,
        "multiplyII",
        {
          a: {value: a, expectedType: "int"},
          b: {value: b, expectedType: "int"}
        },
        "The product of 0 and +/- infinity is undefined in integer multiplication."
      );
    } else {
      // at least one is +/- infinity and the other is not 0 or NaN
      if (a.neg === b.neg) {
        return C.POSITIVE_INFINITY;
      } else {
        return C.NEGATIVE_INFINITY;
      }
    }
  }

  public static squareI(a: int): int {
    if (Comparison.isFiniteI(a)) {
      if (a.digits.length === 1) {
        const square = a.digits[0] * a.digits[0];

        if (square < C.BASE) {
          return new Integer(false, Uint32Array.of(square))
        } else {
          return Core.numberToIntUnchecked(square);
        }
      } else {
        return Basic.karatsubaSquare(a);
      }
    } else if (Comparison.isNaN_I(a)) {
      throw new NaNError(
        Basic.className,
        "squareI",
        "a"
      );
    } else { // a is +/- infinity
      return C.POSITIVE_INFINITY;
    }
  }

  public static divideII(
    a: int,
    b: int,
    type: "euclidean" | "trunc" | "ceil" | "floor" | "round"
  ): {quotient: int, remainder: int} {
    const aIsFinite = Comparison.isFiniteI(a);
    const bIsFinite = Comparison.isFiniteI(b);

    if (aIsFinite && bIsFinite) {
      if (Comparison.isZeroI(b)) { // a / 0 case
        if (Comparison.isPositiveI(a)) {
          return new IntegerDivisionResult(C.POSITIVE_INFINITY, C.NaN);
        } else if (Comparison.isNegativeI(a)) {
          return new IntegerDivisionResult(C.NEGATIVE_INFINITY, C.NaN);
        } else { // both a and b are 0, and 0/0 is undefined
          throw new DomainError(
            Basic.className,
            "divideII",
            {
              a: {value: a, expectedType: "int"},
              b: {value: b, expectedType: "int"}
            },
            "The quotient 0/0 is undefined in integer division"
          );
        }
      } else if (Comparison.isZeroI(a)) {
        return new IntegerDivisionResult(C.I_0, C.I_0);
      } else if (b.digits.length === 1 && b.digits[0] === 1) { // b === +/-1
        return b.neg ?
          new IntegerDivisionResult(Sign.negateI(a), C.I_0)
          :
          new IntegerDivisionResult(a, C.I_0);
      } else if (Comparison.compareArray(a.digits, b.digits) === 0) { // abs(a) === abs(b)
        return a.neg === b.neg ?
          new IntegerDivisionResult(C.I_1, C.I_0)
          :
          new IntegerDivisionResult(C.I_NEG_1, C.I_0);
      } else  {
        const absADivAbsB = Longhand.division(a.digits, b.digits);
        const qIsNegative = a.neg !== b.neg;

        // type = "trunc" results
        let q: int = new Integer(qIsNegative, absADivAbsB.q);
        let r: int = new Integer(a.neg, absADivAbsB.r);

        if (absADivAbsB.r.length === 1 && absADivAbsB.r[0] === 0) { // remainder is zero
          r = C.I_0;
        } else if (type === "euclidean" && a.neg) {
          if (b.neg) {
            q = Basic.addII(q, C.I_1);
            r = Basic.subtractII(r, b);
          } else {
            q = Basic.subtractII(q, C.I_1);
            r = Basic.addII(r, b);
          }
        } else if (type === "ceil" && !qIsNegative) {
          q = Basic.addII(q, C.I_1);
          r = Basic.subtractII(r, b);
        } else if (type === "floor" && qIsNegative) {
          q = Basic.subtractII(q, C.I_1);
          r = Basic.addII(r, b);
        } else if (type === "round") {
          const absBDiv2 = Longhand.divisionBySingleDigit(b.digits, 2);
          const roundCutoff = Longhand.addition(absBDiv2.q, Uint32Array.of(absBDiv2.r));
          if (Comparison.compareArray(b.digits, roundCutoff) >= 0) {
            // in this case q is rounded outward away from 0, no matter its sign
            // which is different from trunc
            if (qIsNegative) {
              q = Basic.subtractII(q, C.I_1);
              r = Basic.addII(r, b);
            } else {
              q = Basic.addII(q, C.I_1);
              r = Basic.subtractII(r, b);
            }
          }
        } else {
          throw new DomainError(
            Basic.className,
            "divideII",
            {
              a: {value: a, expectedType: "int"},
              b: {value: b, expectedType: "int"},
              type: {value: type, expectedType: "string"}
            },
            `The type parameter for integer division must be "euclidean", "trunc",${""
            } "ceil", "floor", or "round"`
          );
        }

        return new IntegerDivisionResult(q, r);
      }
    } else if (Comparison.isNaN_I(a) || Comparison.isNaN_I(b)) {
      throw new NaNError(
        Basic.className,
        "divideII",
        Comparison.isNaN_I(a) ? "a" : "b"
      );
    } else if (aIsFinite) { // b is +/- infinity
      return new IntegerDivisionResult(C.I_0, C.NaN);
    } else if (bIsFinite) { // a is +/- infinity
      // following JavaScript convention with %, remainder is a
      return new IntegerDivisionResult(
        a.neg === b.neg? C.POSITIVE_INFINITY : C.NEGATIVE_INFINITY,
        a
      );
    } else { // both a and b are +/- infinity and infinity/infinity is undefined
      throw new DomainError(
        Basic.className,
        "divideII",
        {
          a: {value: a, expectedType: "int"},
          b: {value: b, expectedType: "int"},
          type: {value: type, expectedType: "string"}
        },
        "The quotient infinity/infinity is undefined in integer division"
      );
    }
  }

  // ********************* float functions ************************************

  public static addFF(x: float, y: float, p: P): float {
    const xIsFinite = Comparison.isFinite(x);
    const yIsFinite = Comparison.isFinite(y);

    if (xIsFinite && yIsFinite) {
      if (Comparison.isZero(x)) {
        return y;
      } else if (Comparison.isZero(y)) {
        return x;
      } else {
        let largerMagVal: float;
        let largerMagValLeastSigDigExp: int;
        let smallerMagVal: float;
        let smallerMagValLeastSigDigExp: int;

        if (Comparison.gte(Sign.absF(x), Sign.absF(y))) {
          largerMagVal = x;
          largerMagValLeastSigDigExp = Basic.leastSigDigPlaceF(x);
          smallerMagVal = y;
          smallerMagValLeastSigDigExp = Basic.leastSigDigPlaceF(y);
        } else {
          largerMagVal = y;
          largerMagValLeastSigDigExp = Basic.leastSigDigPlaceF(y);
          smallerMagVal = x;
          smallerMagValLeastSigDigExp = Basic.leastSigDigPlaceF(x);
        }

        const leastSigDigExp: int = Core.maxI(
          Core.minI(largerMagValLeastSigDigExp, smallerMagValLeastSigDigExp),
          Basic.subtractII(largerMagVal.exp, p.baseDigitsInt)
        );

        if (Comparison.ltI(smallerMagVal.exp, leastSigDigExp)) {
          return largerMagVal;
        }

        const scaledSmallerMagValCoef: int = Basic.scaleFloatCoef(
          smallerMagVal,
          smallerMagValLeastSigDigExp,
          leastSigDigExp
        );
        const scaledLargerMagValCoef: int = Basic.scaleFloatCoef(
          largerMagVal,
          largerMagValLeastSigDigExp,
          leastSigDigExp
        );

        const unroundedCoef = Basic.addII(
          scaledLargerMagValCoef,
          scaledSmallerMagValCoef
        );

        const exp = Basic.addII(
          largerMagVal.exp,
          Core.numberToInt(
            unroundedCoef.digits.length - Math.max(
            scaledSmallerMagValCoef.digits.length,
            scaledLargerMagValCoef.digits.length
            )
          )
        );

        const coef: int = Core.roundOffDigits(unroundedCoef, p.baseDigits);

        return new FloatingPoint(coef, exp);
      }
    } else {
      if (Comparison.isNaN(x) || Comparison.isNaN(y)) {
        throw new NaNError(
          Basic.className,
          "addFF",
          Comparison.isNaN(x) ? "x" : "y"
        );
      } else if (xIsFinite) {   // y must be +/- infinity
        return y;
      } else if (yIsFinite) {  // x must be +/- infinity
        return x;
      } else { // both x and y are +/- infinity
        const xySameSign = Comparison.isNegative(x) === Comparison.isNegative(y);

        if (xySameSign) {
          return x;
        } else {
          throw new DomainError(
            Basic.className,
            "addFF",
            {
              x: {value: x, expectedType: "float"},
              y: {value: y, expectedType: "float"}
            },
            "The sum of positive and negative infinity is undefined in float addition"
          );
        }
      }
    }
  }

  public static incF(x: float, p: P): float { return Basic.addFF(x, C.F_1, p); }

  public static decF(x: float, p: P): float { return Basic.addFF(x, C.F_NEG_1, p); }

  public static sumF(vals: float[], p: P): float {
    if (vals.length === 0) { return C.F_0; }

    let sum = vals[0];

    for (let i = 1; i < vals.length; i++) {
      if (Comparison.isNaN(sum) || Comparison.isNaN(vals[i])) {
        throw new NaNError(
          Basic.className,
          "sumF",
          Comparison.isNaN(sum) ? "sum" : "vals[i]"
        );
      } else {
        sum = Basic.addFF(sum, vals[i], p);
      }
    }

    return sum;
  }

  public static subtractFF(x: float, y: float, p: P): float {
    const xIsFinite = Comparison.isFinite(x);
    const yIsFinite = Comparison.isFinite(y);
    const xIsNaN = Comparison.isNaN(x);
    const yIsNaN = Comparison.isNaN(y);

    if ((xIsFinite && !yIsNaN) || (yIsFinite && !xIsNaN)) {
      return Basic.addFF(x, Sign.negateF(y), p);
    } else if (xIsNaN || yIsNaN) {
      throw new NaNError(
        Basic.className,
        "subtractFF",
        Comparison.isNaN(x) ? "x" : "y"
      );
    } else { // both a and b are +/- infinity
      const differentSign = Comparison.isNegative(x) !== Comparison.isNegative(y);

      if (differentSign) {
        return x;
      } else {
        throw new DomainError(
          Basic.className,
          "subtractFF",
          {
            x: {value: x, expectedType: "float"},
            y: {value: y, expectedType: "float"}
          },
          `The difference of infinite values of the same sign is undefined in float${""
            } subtraction.`
        );
      }
    }
  }

  public static multiplyFF(x: float, y: float, p: P): float {
    if (Comparison.isFinite(x) && Comparison.isFinite(y)) {
      const neg = x.coef.neg !== y.coef.neg;
      const coefDigits = Longhand.multiplicationLengthLimit(
        x.coef.digits,
        y.coef.digits,
        p.baseDigits
      );

      const exp = Basic.addII(Basic.addII(x.exp, y.exp), coefDigits.expAdjustment);

      return new FloatingPoint(new Integer(neg, coefDigits.result), exp);
    } else if (Comparison.isNaN(x) || Comparison.isNaN(y)) {
      throw new NaNError(
        Basic.className,
        "multiplyFF",
        Comparison.isNaN(x) ? "x" : "y"
      );
    } else if (Comparison.isZero(x) || Comparison.isZero(y)) {
      // one is 0 and the other is +/- infinity
      throw new DomainError(
        Basic.className,
        "multiplyFF",
        {
          x: {value: x, expectedType: "float"},
          y: {value: y, expectedType: "float"}
        },
        "The product of 0 and +/- infinity is undefined in float multiplication"
      );
    } else {
      // at least one is +/-infinity and the other is not 0 or NaN
      if (x.coef.neg === y.coef.neg) {
        return C.F_POSITIVE_INFINITY;
      } else {
        return C.F_NEGATIVE_INFINITY;
      }
    }
  }

  public static productF(vals: float[], p: P): float {
    if (vals.length === 0) { return C.F_0; }

    let product = vals[0];

    for(let i = 1; i < vals.length; i++) {
      product = Basic.multiplyFF(product, vals[i], p);
    }

    return product;
  }

  public static squareF(x: float, p: P): float {
    if (Comparison.isFinite(x)) {
      const coefDigits = Longhand.multiplicationLengthLimit(
        x.coef.digits,
        x.coef.digits,
        p.baseDigits
      );
      const exp = Basic.addII(Basic.addII(x.exp, x.exp), coefDigits.expAdjustment);

      return new FloatingPoint(new Integer(false, coefDigits.result), exp);
    } else if (Comparison.isNaN(x)) {
      throw new NaNError(
        Basic.className,
        "squareF",
        "x"
      );
    } else {
      return C.F_POSITIVE_INFINITY;
    }
  }

  public static reciprocalF(x: float, p: P): float {
    if (Comparison.isFinite(x)) {
      if (Comparison.isZero(x)) {
        return C.F_POSITIVE_INFINITY;
      } else {
        // Newton-Raphson method of finding a reciprocal
        return Basic.newtonInversion(x, p);
      }
    } else if (Comparison.isNaN(x)) {
      throw new NaNError(
        Basic.className,
        "reciprocalF",
        "x"
      );
    } else { // x is +/- infinity
      return C.F_0;
    }
  }

  public static divideFF(x: float, y: float, p: P): float {
    const xIsFinite = Comparison.isFinite(x);
    const yIsFinite = Comparison.isFinite(y);

    if (Comparison.isNaN(x) || Comparison.isNaN(y)) {
      throw new NaNError(
        Basic.className,
        "divideFF",
        Comparison.isNaN(x) ? "x" : "y"
      );
    } else if (xIsFinite || yIsFinite) {
      if (Comparison.isZero(y) && Comparison.isZero(x)) {
        throw new DomainError(
          Basic.className,
          "divideFF",
          {
            x: {value: x, expectedType: "float"},
            y: {value: y, expectedType: "float"}
          },
          "The quotient 0/0 is undefined in float division"
        );
      } else if (Comparison.equals(Sign.absF(x), Sign.absF(y))){
        return x.coef.neg === y.coef.neg ? C.F_1 : C.F_NEG_1;
      } else {
        return Basic.multiplyFF(x, Basic.newtonInversion(y, p), p)
      }
    } else { // both x and y are +/- infinity
      throw new DomainError(
        Basic.className,
        "divideFF",
        {
          x: {value: x, expectedType: "float"},
          y: {value: y, expectedType: "float"}
        },
        "The quotient infinity/infinity is undefined in float division"
      );
    }
  }

  // ********************* support functions ************************************

  public static leastSigDigPlaceF(x: float): int {
    return Basic.addII(
      x.exp,
      Core.numberToInt(1 - x.coef.digits.length)
    );
  }

  public static scaleFloatCoef(
    x: float,
    xLeastSigDigExp: int,
    desiredLeastSigDigExp: int
  ): int {
    if (Comparison.gtI(xLeastSigDigExp, desiredLeastSigDigExp)) {
      const zerosToAdd = Core.intToNumber(Basic.subtractII(
        xLeastSigDigExp,
        desiredLeastSigDigExp
      ));

      return new Integer(
        x.coef.neg,
        Core.scaleArrayByBase(x.coef.digits, zerosToAdd)
      );
    } else {
      const digitsToKeep: number = 1 + Core.intToNumber(Basic.subtractII(
        x.exp,
        desiredLeastSigDigExp
      ));

      return Core.roundOffDigits(
        x.coef,
        digitsToKeep
      );
    }
  }

  public static karatsuba(a: int, b: int): int {
    if (Comparison.isZeroI(a) || Comparison.isZeroI(b)) {
      return C.I_0;
    } else if (a.digits.length === 1 && a.digits[0] === 1) { // a === +/-1
      return a.neg ? Sign.negateI(b) : b;
    } else if (b.digits.length === 1 && b.digits[0] === 1) { // b === +/-1
      return b.neg ? Sign.negateI(a) : a;
    } else if (a.digits.length <= 200 || b.digits.length <= 200
      || a.digits.length/b.digits.length < 0.15
      || b.digits.length/a.digits.length < 0.15) {
      return new Integer(
        a.neg !== b.neg,
        Longhand.multiplication(a.digits, b.digits)
      );
    } else {
      const n = Math.max(a.digits.length, b.digits.length);
      const m = Math.ceil(n/2);
      const aSplit = Core.splitInt(a, m);
      const bSplit = Core.splitInt(b, m);

      const z2 = Basic.multiplyII(aSplit.hi, bSplit.hi);
      const z0 = Basic.multiplyII(aSplit.lo, bSplit.lo);
      const z1 = Basic.addII(
        Basic.addII(
          Basic.multiplyII(
            Basic.subtractII(aSplit.lo, aSplit.hi),
            Basic.subtractII(bSplit.hi, bSplit.lo)
          ),
          z2
        ),
        z0
      );

      const summand2 = Core.scaleIntByBase(z2, 2*m);
      const summand1 = Core.scaleIntByBase(z1, m);

      return Basic.addII(Basic.addII(summand2, summand1), z0);
    }
  }

  public static karatsubaSquare(a: int): int {
    if (Comparison.isZeroI(a)) {
      return C.I_0;
    } else if (a.digits.length === 1 && a.digits[0] === 1) { // a === +/-1
      return Sign.absI(a);
    } else if (a.digits.length <= 200) {
      return new Integer(false, Longhand.square(a.digits));
    } else {
      const n = a.digits.length;
      const m = Math.ceil(n/2);
      const aSplit = Core.splitInt(a, m);

      const z2 = Basic.squareI(aSplit.hi);
      const z0 = Basic.squareI(aSplit.lo);
      const z1 = Basic.addII(
        Basic.addII(
          Sign.negateI(Basic.squareI(Basic.subtractII(aSplit.lo, aSplit.hi))),
          z2
        ),
        z0
      );

      const summand2 = Core.scaleIntByBase(z2, 2*m);
      const summand1 = Core.scaleIntByBase(z1, m);

      return Basic.addII(Basic.addII(summand2, summand1), z0);
    }
  }

  /**
   * This function takes a finite float x and decomposes its absolute value into a
   * finite integer number c and a finite int e such that:
   *
   *      c =(approx)= |x| * (BASE^(-e))  i.e.  |x| =(approx)= c * (BASE^e)
   *
   * @param {float} x - a finite float
   * @returns {{c: number; e: int}}
   */
  public static sciNoteBASEApprox(x: float): {c: number, e: int} {
    const maxIter = Math.min(3, x.coef.digits.length);
    const maxIterMinus1 = maxIter - 1;
    let c = 0;

    for (let i = 0; i < maxIter; i++) {
      c += x.coef.digits[i];
      if (i !== maxIterMinus1) {
        c *= C.BASE;
      }
    }

    return {c: c, e: Basic.subtractII(x.exp, Core.numberToInt(maxIterMinus1))};
  }

  public static newtonInversion(x: float, p: P): float {
    const sciNote = Basic.sciNoteBASEApprox(x);
    const zInv = 1/sciNote.c;
    const zInvFloat = Core.numberToFloatUnchecked(zInv);

    // here is our initial estimate of 1/x
    let yi = new FloatingPoint(
      new Integer(x.coef.neg, zInvFloat.coef.digits),
      Basic.subtractII(zInvFloat.exp, sciNote.e)
    );

    // now refine it with Newton-Raphson method using f(y) = (1/y) - D, thus
    // f'(y) = -y^(-2) so the iterative step is:
    // y_i+1 = 2 * y_i - x * y_i^2
    const steps = p.quadraticConvergenceSteps;

    for (let i = 0; i < steps; i++) {
      const xTimesYi = Basic.multiplyFF(x, yi, p);
      const oneMinusXYi = Basic.subtractFF(C.F_1, xTimesYi, p);

      if (Comparison.lt(Sign.absF(oneMinusXYi), p.epsilon) ) {
        break;
      }

      const xTimesYiSquared = Basic.multiplyFF(xTimesYi, yi, p);
      const twoTimesYi = Basic.multiplyFF(C.F_2, yi, p);

      yi = Basic.subtractFF(twoTimesYi, xTimesYiSquared, p);
    }

    return yi;
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      Integer, FloatingPoint, IntegerDivisionResult, C, Sign, Core, Comparison, Longhand,
      NaNError, DomainError
    ]);
  }
}


// *** imports come at end to avoid circular dependency ***

// interface/type imports
import {int} from "../interfacesAndTypes/int";
import {float} from "../interfacesAndTypes/float";
import {Class} from "../interfacesAndTypes/Class";

import {P as PAlias} from "../dataTypes/P";
export type P = PAlias;


// functional imports
import {Integer as IntegerAlias} from "../dataTypes/Integer";
const Integer = IntegerAlias;

import {FloatingPoint as FloatingPointAlias} from "../dataTypes/FloatingPoint";
const FloatingPoint = FloatingPointAlias;

import {IntegerDivisionResult as IntegerDivisionResultAlias}
  from "../dataTypes/IntegerDivisionResult";
const IntegerDivisionResult = IntegerDivisionResultAlias;

import {C as CAlias} from "../constants/C";
const C = CAlias;

import {Sign as SignAlias} from "./Sign";
const Sign = SignAlias;

import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;

import {Comparison as ComparisonAlias} from "./Comparison";
const Comparison = ComparisonAlias;

import {Longhand as LonghandAlias} from "../core/Longhand";
const Longhand = LonghandAlias;

import {NaNError as NaNErrorAlias} from "../errors/NaNError";
const NaNError = NaNErrorAlias;

import {DomainError as DomainErrorAlias} from "../errors/DomainError";
const DomainError = DomainErrorAlias;

import {Library as LibraryAlias} from "../core/Library";
const Library = LibraryAlias;
