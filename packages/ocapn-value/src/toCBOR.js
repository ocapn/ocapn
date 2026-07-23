// @ts-check
import cbor from "cbor";
import { MT } from "cbor/types/lib/constants";
import { tagSymbol } from "./ocapn-value";

// https://www.rfc-editor.org/rfc/rfc8949.html#section-3.4.6
const SELF_DESCRIBED = 55799;

/**
 * TODO: Cap
 * TODO: check return value from encoder methods
 *
 * @param {cbor.Encoder} encoder
 * @param {import('./ocapn-value').Value<never, Error>} value
 */
export const toCBOR = (encoder, value) => {
  switch (typeof value) {
    case "undefined":
    case "boolean":
    case "number":
    case "string":
    case "bigint":
      encoder.pushAny(value);
      break;
    case "symbol":
      encoder._pushTag(SELF_DESCRIBED);
      encoder.pushAny("S");
      encoder.pushAny(value.toString());
      break;
    case "object":
      if (value === null) {
        encoder.push(null);
      } else if (value instanceof Error) {
        encoder._pushTag(SELF_DESCRIBED);
        encoder.pushAny("E");
        encoder._pushInt(2, MT.ARRAY);
        encoder.pushAny(value.name);
        encoder.pushAny(value.message);
      } else if (tagSymbol in value) {
        encoder._pushTag(SELF_DESCRIBED);
        encoder._pushInt(3, MT.ARRAY);
        encoder.pushAny("T");
        const { [tagSymbol]: tag } = value;
        encoder.pushAny(tag);
        toCBOR(encoder, value.value);
      } else if (value instanceof Uint8Array) {
        encoder.pushAny(value);
      } else if (Array.isArray(value)) {
        encoder._pushInt(value.length, MT.ARRAY);
        for (const v of value) {
          toCBOR(encoder, v);
        }
      } else {
        const length = Object.keys(value).length;
        encoder._pushInt(length, MT.MAP);
        for (const [k, v] of Object.entries(value)) {
          encoder.pushAny(k);
          toCBOR(encoder, v);
        }
      }
      break;
    default:
      throw TypeError(`Unknown type: ${typeof value}`);
  }
};
