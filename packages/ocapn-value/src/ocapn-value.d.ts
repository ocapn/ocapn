// TypeScript requires a little gymnastics to handle recursive types.

export type Atom =
  | undefined
  | null
  | boolean
  | number
  | bigint
  | string
  | ByteString
  | symbol;
export type ByteString = Uint8Array;
const tagSymbol: unique symbol = Symbol();
export type Tagged<Cap, Err> = { [tagSymbol]: string; value: Value<Cap, Err> };
export type Value<Cap, Err> =
  | Atom
  | ValueArray<Cap, Err>
  | ValueRecord<Cap, Err>
  | Tagged<Cap, Err>
  | Cap
  | Err;
interface ValueArray<Cap, Err> extends Array<Value<Cap, Err>> {}
interface ValueRecord<Cap, Err> extends Record<string, Value<Cap, Err>> {}
