
# Notation

The OCapN specification uses an Abstract Notation for the corresponding
Concrete Representation of messages.
This document describes both the notation and representation.
The [CapTP Specification](CapTP%20Specification.md) and [Model](Model.md) documents
employ the abstract notation to imply the conrete representation.

The concrete representation is a binary encoding that is occasionally and
incidentally human-readable.

The abstract notation is human-readable and human-writable and is not intended
for machine processing.
The abstract notation does not attempt to comprehensively cover all expressible
concrete messages, but is suitable for expressing all the specification and
examples.

> The abstract notation comes from
> [Preserves](https://preserves.gitlab.io/preserves/TUTORIAL.html).
> The concrete representation is a subset of
> [Syrup](https://github.com/ocapn/syrup).

## Notation of the Notation

For the grammars of both the abstract notation and concrete representations,
this document uses the following notation:

- `literal`
- adjacent adjacent
- alternative / alternative
- zero or more *
- one or more +
- first - last
- optional ?
- ( group )
- _reference_
- _referent_ : _definition_
- :: semantics

Both grammars allow for the interpolation of arbitrary [ASCII]
(https://datatracker.ietf.org/doc/html/rfc20) space (SP), tab (HT), carriage
return (CR), and line feed (LF) characters between tokens.

Commentary in block quotes is not normative.

> Non-normative commentary.

## Value

A representation of any expressible value in an OCapN message.

- _abstract-value_: _abstract-boolean_ / _abstract-integer_ /
  _abstract-float64_ / _abstract-selector_ / _abstract-string_ /
  _abstract-byte-array_ / _abstract-byte-array_ / _abstract-struct_ /
  _abstract-list_ / _abstract-record_
- _concrete-value_: _concrete-boolean_ / _concrete-integer_ /
  _concrete-float64_ / _concrete-selector_ / _concrete-string_ /
  _concrete-byte-array_ / _concrete-byte-array_ / _concrete-struct_ /
  _concrete-list_ / _concrete-record_

## Boolean

A value that is either true or false.

> Examples:
> - `f` corresponds to `f`.
> - `t` corresponds to `t`.

- _abstract-boolean_: `f` / `t` :: Corresponding to false and true respectively.
- _concrete-boolean_: `f` / `t`

## Integer

An arbitrary precision signed integer.

> Examples:
> - `42` corresponds to `42+`.
> - `-1` corresponds to `1-`.
> - `0` corresponds to `0+`.

- _abstract-integer_: _sign_? _digit_+
- _sign_: `+` / `-`
- _concrete-integer_: _digit_+ _sign_ :: No preceding zeroes.

## Float64

An IEEE 754 64-bit floating point number.

> Examples:
> - `nan` corresponds to the bytes 44 (`"D"`), 7f, f8, 00, 00, 00, 00, 00, 00
>   in hexadecimal.

- _abstract-float64_: _abstract-float64-number_ / _sign_? `inf` / `nan`
- _abstract-float64-number_: _sign_? _digit_* `.` _digit_* :: Corresponding to the nearest
  expressible concrete IEEE 754 64-bit floating point number.
- _concrete-float64_: `D` followed by the corresponding bytes of an IEEE 754 64-bit
  floating point number.

## String

A sequence of Unicode code points excluding surrogates (U+D800-U+DFFF).

> Example: `"twine"` corresponds to `5"twine`.

- _abstract-string_: `"` _character_ * `"`
- _character_:: ` ` / _alpha_ / _digit_ / (_ASCII graphic characters except_
  `"` / `\`).
- _concrete-string_: _length_ `"` _bytes_
- _length_: _digit_* :: The number of bytes in _bytes_ in
  ASCII decimal digits.
- _bytes_: _byte_* :: The bytes of the string in UTF-8 encoding.

We do not attempt to capture strings with embedded quotes or non-ASCII Unicode
characters in the abstract notation, but all Unicode strings excluding
surrogates (U+D800-U+DFFF) are expressible in the concrete representation.

## Selector

A sequence of Unicode code points excluding surrogates (U+D800-U+DFFF).

> Example: `'fleur-de-lis` corresponds to `12'fleur-de-lis`.

- _abstract-selector_: `'` _name_
- _name_: _alpha_ ( _alpha_ / _digit_ / `-` )*
- _alpha_: `a` - `z` / `A` - `Z`
- _digit_: `0` - `9`
- _concrete-selector_: _length_ `'` _bytes_
- _bytes_: _byte_* :: The bytes of the selector in UTF-8 encoding.

We do not attempt to capture selectors with arbitrary Unicode characters in the
abstract notation, but all Unicode strings excluding surrogates (U+D800-U+DFFF)
are expressible in the concrete representation.

## ByteArray

An array of 8-bit bytes.

> Example: `:b0b5c0ffeefacade` corresponds to the bytes of `8`, `:`, b0, b5,
> c0, ff, ee, fa, ca, de in ASCII and hexadecimal.

- _abstract-byte-array_: `:` _hex_
- _hex_: ( _hex-digit_ _hex-digit_ )*
- _hex-digit_: `0` / `1` / `2` / `3` / `4` / `5` / `6` / `7` / `8` / `9` /
  `a` / `b` / `c` / `d` / `e` / `f` :: Corresponding to a _byte_ of _bytes_.
- _concrete-byte-array_: _length_ `:` _bytes_ :: The number of bytes in _bytes_
  and the _bytes_.

We do not attempt to capture byte arrays with non-space ASCII characters in the
abstract notation, but all byte arrays are expressible in the concrete
representation.

## Struct

> The name "struct" is tentative.
> https://github.com/ocapn/ocapn/pull/125

A collection of unordered (key, value) pairs.

> Examples:
> - `{ a: 10, b: 2 }` corresponds to `{ 1"a 10+ 1"b 2+ }`.
> - `{ "a": 10, "b": 2 }` corresponds to `{ 1"a 10+ 1"b 2+ }`.
> - `{ 'a: 10, 'b: 2 }` corresponds to `{ 1'a 10+ 1'b 2+ }`.

- _abstract-struct_: `{` ( _abstract-field_ ( `,` _abstract-field_ )* )? `}`
- _abstract-field_: _abstract-key_ `:` _abstract-value_
- _abstract-key_: _abstract-field-name_ / _abstract-value_
- _abstract-field-name_: _name_ :: Corresponding to a string.

> The [Model](Model.md) limits field names in structs to strings, but for
> purposes of [CapTP](CapTP Specification.md) surrounding data, the notation
> and representation allow any value.

The notation allows a shorthand where a field name may be an alphanumeric ASCII
name without a prefix `"`, in which case the field name is a [String](#string).

## List

A list of any quantity of values.

> Example: `[ 1 2 3 ]` corresponds to `[ 1+ 2+ 3+ ]`.

- _abstract-list_: `[` ( _abstract-value_ ( `,` _abstract-value_ )* )? `]`
- _concrete-list_: `[` _concrete-value * `]` :: The respective concrete
  representations of the abstract values.

## Record

A tuple of any quantity of values.

> Examples:
> - `<foo 1 2 3>` corresponds to `<3'foo 1+ 2+ 3+>`
> - `<'foo 1 2 3>` corresponds to `<3'foo 1+ 2+ 3+>`
> - `<"foo 1 2 3>` corresponds to `<3"foo 1+ 2+ 3+>`

- _abstract-record_: `<` ( _abstract-value_ ( `,` _abstract-value_ )* )? `>`
- _concrete-record_: `<` _concrete-field_ * `>`
- _concrete-field_: _concrete-field-name_ / _concrete-value_
- _concrete-field-name_: _name_ :: Corresponding to a selector.

> The first value is typically a selector to multiplex the shapes and behaviors
> implied by the record, but may be any value.

The notation allows a shorthand where the first value of a record may be a bare
alphanumeric name without a prefix `'`, in which case he value is a
[Selector](#selector).

> Records do not correspond to a paricular type in the [Model](Model.md), but
> are instrumenal in represnting messages in the [protocol](CapTP
> Specification.md) and envelope many types in the concrete represenation of
> the passable data model.
>
> The name "record" does not indicate a relationship to TypeScript records.
> They are more analogous to Python tuples.