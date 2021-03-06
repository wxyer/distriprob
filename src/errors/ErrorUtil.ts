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

export class ErrorUtil {
  public static className: string;

  public static init0(): void {
    ErrorUtil.className = "ErrorUtil";
  }

  public static typeDescription(x: any): string {
    if (Core.instance(x)) {
      return "float";
    } else if (Core.instanceI(x)) {
      return "int";
    } else if (JSONFloat.instance(x)) {
      return "JSONFloat";
    } else if (JSONInt.instance(x)) {
      return "JSONInt";
    } else if (typeof x === "object") {
      return `object(constructor: ${x.constructor.name}`;
    } else {
      return typeof x;
    }
  }

  public static isTypeDescriptor(x: any): x is TypeDescriptor {
    return typeof x === "string" && (
      x === "string" || x === "boolean" || x === "number" || x === "float" ||
      x === "int" || x === "Float" || x === "float or int" || x === "Int" ||
      x === "FloatEquivalent" || x === "IntEquivalent" || x === "IntDivResult" ||
      x === "FloatDivResult" || x === "JSONFloat" || x === "JSONInt" || x === "P" ||
      x === "Config" || x === "function" || x === "seed"
    );
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      Core, JSONInt, JSONFloat,
    ]);
  }
}


// *** imports come at end to avoid circular dependency ***

// interface/type imports
import {Class} from "../interfacesAndTypes/Class";
import {TypeDescriptor} from "../interfacesAndTypes/TypeDescriptor";

// functional imports
import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;

import {JSONInt as JSONIntAlias} from "../dataTypes/JSONInt";
const JSONInt = JSONIntAlias;

import {JSONFloat as JSONFloatAlias} from "../dataTypes/JSONFloat";
const JSONFloat = JSONFloatAlias;