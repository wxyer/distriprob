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


export class RandomUtil {
  public static className: string;
  private static MULTIPLIERS: number[];

  public static init0(): void {
    RandomUtil.className = "RandomUtil";
    RandomUtil.MULTIPLIERS = [7342563, 255, 33, 729134239, 1515, 19, 1035673];
  }

  public static getRandomTypedArray(
    length: number,
    units: 8 | 16 | 32
  ): Uint8Array | Uint16Array | Uint32Array {
    let typedArrayConstructor = RandomUtil.getTypedArrayConstructor(units);

    if (Core.environmentIsNode()) {
      const crypto = require("crypto");
      const nodeBuf = crypto.randomBytes(
        typedArrayConstructor.BYTES_PER_ELEMENT * length
      );

      return new typedArrayConstructor(
        nodeBuf.buffer,
        nodeBuf.byteOffset,
        nodeBuf.byteLength / typedArrayConstructor.BYTES_PER_ELEMENT
      );
    } else if (crypto) {
      const result = new typedArrayConstructor(length);
      crypto.getRandomValues(result);
      return result;
    } else {
      // not a cryptographically secure array of random bits
      const result = new typedArrayConstructor(length);
      const max = 256 ** typedArrayConstructor.BYTES_PER_ELEMENT;

      for (let i = 0; i < length; i++) {
        result[i] = Math.floor(Math.random() * max)
      }

      return result;
    }
  }

  public static getSeededTypedArray(
    length: number,
    units: 8 | 16 | 32,
    seed: string
  ): Uint8Array | Uint16Array | Uint32Array {
    let typedArrayConstructor = RandomUtil.getTypedArrayConstructor(units);
    const result = new typedArrayConstructor(length);
    const max = 2 ** units;
    let comp = false;
    let j = 0;
    let iModLength: number;
    let charCode: number;
    let val: number;

    for(let i = 0; i < Math.max(seed.length, length); i++) {
      iModLength = i % length;
      charCode = (seed.charCodeAt(i % seed.length) * RandomUtil.MULTIPLIERS[j]) % max;
      val = comp ? ~ charCode : charCode;
      result[iModLength] = result[iModLength] ^ val;
      comp = !comp;
      j = (j + 1) % RandomUtil.MULTIPLIERS.length;
    }

    return result;
  }



  private static getTypedArrayConstructor(
    units: 8 | 16 | 32
  ): Uint32ArrayConstructor | Uint16ArrayConstructor | Uint8ArrayConstructor {
    if (units === 8) {
      return Uint8Array;
    } else if (units === 16) {
      return Uint16Array;
    } else {
      return Uint32Array;
    }
  }


  // class dependencies
  public static dependencies(): Set<Class> {
    return new Set([
      Core,
    ]);
  }
}


// *** imports come at end to avoid circular dependency ***

// interface/type imports
import {Class} from "../interfacesAndTypes/Class";


// functional imports
import {Core as CoreAlias} from "../core/Core";
const Core = CoreAlias;


