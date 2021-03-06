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
 * This class serves to wrap an internal library function with functions for usage outside
 * the library.
 */
export class FunctionWrapper {
  public static className: string;

  public static init0(): void {
    this.className = "FunctionWrapper";
  }

  public readonly name: string;
  public readonly category: "index-function" | "Float-method" | "Int-method";
  public readonly internalSpec: internalFunctionSpec;
  public readonly internalFunct: Function;
  public readonly params: Array<ParameterSpec>;
  public readonly configParamIndex: number;
  public readonly relPrec: number;
  public readonly returnType: TypeDescriptor;
  public readonly packageFunctions: Array<PackageFunction>;
  public readonly outputFunction: OutputFunction | null;

  constructor(
    descriptor: string | MethodSpec,
    internalFunctionSpec: internalFunctionSpec
  ) {
    let methodSpec: MethodSpec | undefined;

    if (typeof descriptor === "string") {
      this.name = descriptor;
      this.category = "index-function";
    } else {
      methodSpec = descriptor;
      this.name = descriptor.name;
      if (descriptor.type === "Float") {
        this.category = "Float-method";
      } else {
        this.category = "Int-method";
      }
    }

    this.internalSpec = internalFunctionSpec;
    this.internalFunct = internalFunctionSpec.funct;
    this.relPrec = internalFunctionSpec.relPrec;

    const input = Input.getInputValuesForExternalFunct(internalFunctionSpec, methodSpec);
    this.params = input.params;
    this.configParamIndex = input.configParamIndex;
    this.packageFunctions = [];

    for(let i = 0; i < input.packageFunctGens.length; i++) {
      this.packageFunctions.push(input.packageFunctGens[i](this, i));
    }

    const output = Output.getOutputValuesForExternalFunct(internalFunctionSpec);
    this.returnType = output.returnType;
    this.outputFunction = output.outputFunctGen === null ?
      null
      :
      output.outputFunctGen(this);
  }

  public executable(): (...args: Array<any>) => any {
    const fwThis = this;

    return function(...args: Array<any>): any {
      // first package up args for use in internal function
      const config = typeof args[fwThis.configParamIndex] === "undefined" ?
        Configuration.default
        :
        args[fwThis.configParamIndex];
      const internalArgs: Array<any> = [];

      for(let i = 0; i < fwThis.packageFunctions.length; i++) {
        internalArgs.push(fwThis.packageFunctions[i](args[i], config));
      }

      // now run internal function any catch and deal with any errors
      let internalResult: any;

      try {
        internalResult = fwThis.internalFunct(...internalArgs);
      } catch (e) {
        // Todo fill out with correct type of Error depending on e
        throw Error("Not correctly implemented yet1");
      }

      // now run output function if necessary and return
      if (fwThis.outputFunction === null) {
        return internalResult;
      } else {
        return fwThis.outputFunction(internalResult, config);
      }
    }
  }

  public method(): (...args: Array<any>) => any {
    const fwThis = this;

    return function(...args: Array<any>): any {
      // first package up args for use in internal function
      const config = typeof args[fwThis.configParamIndex] === "undefined" ?
        Configuration.default
        :
        args[fwThis.configParamIndex];
      const internalArgs: Array<any> = [];

      let argIndex = 0;
      for(let i = 0; i < fwThis.packageFunctions.length; i++) {
        if (fwThis.params[i].instance) {
          internalArgs.push(fwThis.packageFunctions[i](this, config));
          argIndex--;
        } else {
          internalArgs.push(fwThis.packageFunctions[i](args[argIndex], config));
        }
        argIndex++;
      }

      // now run internal function any catch and deal with any errors
      let internalResult: any;

      try {
        internalResult = fwThis.internalFunct(...internalArgs);
      } catch (e) {
        // Todo fill out with correct type of Error depending on e
        throw Error("Not correctly implemented yet");
      }

      // now run output function if necessary and return
      if (fwThis.outputFunction === null) {
        return internalResult;
      } else {
        return fwThis.outputFunction(internalResult, config);
      }
    }
  }



  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      Configuration, Input, Output,
    ]);
  }
}


// *** imports come at end to avoid circular dependency ***

// interface/type imports
import {Class} from "../../interfacesAndTypes/Class";
import {TypeDescriptor} from "../../interfacesAndTypes/TypeDescriptor";
import {internalFunctionSpec} from "../../core/Library";
import {ParameterSpec} from "../../interfacesAndTypes/ParameterSpecs/ParameterSpec";
import {PackageFunction} from "./Input";
import {OutputFunction} from "./Output";
import {MethodSpec} from "../API/APISpec";

// functional imports

import {Configuration as ConfigurationAlias} from "../Configuration";
const Configuration = ConfigurationAlias;

import {Input as InputAlias} from "./Input";
const Input = InputAlias;

import {Output as OutputAlias} from "./Output";
const Output = OutputAlias;