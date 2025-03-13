
# Formats

The OCapN protocol consists of delimited messages over bi-directional
connections between peers.
This document describes both the binary serialization format of messages on the
wire (Wire Format) and the notation that this specification uses to communicate
the shapes of these messages (Presentation Format).
For every message in the Presentation Format there is a single, unambiguous,
canonical representation in Wire Format.
OCapN peers must send messages in the canonical representation.
OCapN peers must reject messages they receive that are not in their canonical
representation.

> The Presentation Format frees the specification from the concern of counting
> and maintaining length-prefixes for many types of data, sorting field names,
> and the byte-for-byte expression of opaque binary data like Float64 and
> ByteArray, while also allowing the specification to use whitespace and
> annotate examples with comments.
>
> Many messages in the Wire Format are incidentally human-readable and
> human-writable, and while that may prove useful, the format prioritizes
> machine-processing over human-processing and often abandons human-readability
> and human-writability, as for ByteArray and Float64.
>
> Not all expressible messages in the Wire Format have a corresponding
> Presentation Format.
> For example, many valid Strings are inexpressible in the Presentation Format,
> as precisely specifying rules for escaping all expressible Unicode code
> points to the elimination of any ambiguity is not germane to the purpose of
> the Presentation Format.
> The Presentation Format as presented here is only necessarily complete enough
> to express the OCapN specification.
>
> The muses for the OCapN Presentation Format and Wire Format are
> [Preserves](https://preserves.gitlab.io/preserves/TUTORIAL.html)
> and [Syrup](https://github.com/ocapn/syrup).

## Notation

For the grammars of both the Presentation Format and Wire Format, this document
uses the following notation:

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
- ; semantics

The Presentation Format ignores arbitrary
[ASCII](https://datatracker.ietf.org/doc/html/rfc20) space (SP), tab (HT),
carriage return (CR), and line feed (LF) characters between tokens.
The Presentation Format affords comments by ignoring any text beginning with
semi-colon (`;`) until the end of a line.

In pursuit of a canonical representation for all messages, the Wire Format does
not include nor tolerate any bytes between tokens and does not support
comments.

Commentary in block quotes is not normative.

> Non-normative commentary.

## Value

A representation of any expressible value in an OCapN message.

- _presentation-value_: _presentation-boolean_ / _presentation-integer_ /
  _presentation-float64_ / _presentation-selector_ / _presentation-string_ /
  _presentation-byte-array_ / _presentation-struct_ /
  _presentation-list_ / _presentation-record_
- _wire-value_: _wire-boolean_ / _wire-integer_ /
  _wire-float64_ / _wire-selector_ / _wire-string_ /
  _wire-byte-array_ / _wire-struct_ /
  _wire-list_ / _wire-record_

## Boolean

A value that is either true or false.

> Examples:
> - `f` corresponds to `f`.
> - `t` corresponds to `t`.

- _presentation-boolean_: `f` / `t` ; Corresponding to false and true respectively.
- _wire-boolean_: `f` / `t`

## Integer

An arbitrary precision signed integer.

> Examples:
> - `42` corresponds to `42+`.
> - `-1` corresponds to `1-`.
> - `0` corresponds to `0+`.

- _presentation-integer_: _sign_? _integer-digits_
- _sign_: `+` / `-`
- _integer-digits_: ( `0` / ( `1` - `9` ) _digit_* )
- _wire-integer_: _integer-digits_ _sign_

## Float64

An IEEE 754 64-bit floating point number.

In Presentation Format, `nan` represents NaN (Not A Number).
In Wire Format, `nan` corresponds to the bytes 44 (`"D"`), 7f, f8, 00, 00, 00,
00, 00, 00 in hexadecimal.
OCapN messages may not contain any other bytewise representation of an IEEE 754
64-bit NaN.

- _presentation-float64_: _presentation-float64-number_ / ( _sign_? `inf` ) / `nan`
- _presentation-float64-number_: _presentation-integer_ `.` _digit_* /
  _sign_? `.` _digit_+ ; Corresponding to the nearest expressible concrete IEEE
  754 64-bit floating point number, rounding ties to even.
- _wire-float64_: `D` followed by the corresponding 8 bytes of an IEEE 754
  64-bit floating point number.

## String

A sequence of [Unicode](https://www.unicode.org/standard/standard.html) code
points excluding surrogates (U+D800-U+DFFF).

> Example: `"twine"` corresponds to `5"twine`.

- _presentation-string_: `"` _presentation-character_ * `"`
- _presentation-character_: _any printable ASCII character except `"` or `\`_ ;
  note that spaces are printable
- _wire-string_: _length_ `"` _bytes_
- _length_: _integer-digits_ ; The number of bytes in _bytes_ as ASCII decimal
  digits.
- _bytes_: _byte_* ; The bytes of the string in UTF-8 encoding.

We do not attempt to capture strings with embedded quotes or non-ASCII Unicode
characters in the Presentation Format, but all Unicode strings excluding
surrogates (U+D800-U+DFFF) are expressible in the Wire Format.

## Selector

A sequence of Unicode code points excluding surrogates (U+D800-U+DFFF).

> Example: `'fleur-de-lis` corresponds to `12'fleur-de-lis`.

- _presentation-selector_: `'` _name_
- _name_: _alpha_ ( _alpha_ / _digit_ / `-` / `:` )*
- _alpha_: ( `a` - `z` ) / ( `A` - `Z` )
- _digit_: `0` - `9`
- _wire-selector_: _length_ `'` _bytes_
- _bytes_: _byte_* ; The bytes of the selector in UTF-8 encoding.

We do not attempt to capture selectors with arbitrary Unicode characters in the
Presentation Format, but all Unicode strings excluding surrogates
(U+D800-U+DFFF) are expressible in the Wire Format.

## ByteArray

An array of 8-bit bytes.

> Example: `:b0b5c0ffeefacade` corresponds to the bytes of `8`, `:`, b0, b5,
> c0, ff, ee, fa, ca, de in ASCII and hexadecimal.

- _presentation-byte-array_: `:` _hex_
- _hex_: ( _hex-digit_ _hex-digit_ )*
- _hex-digit_: _digit_ / ( `a` - `f` ) ; Corresponding to a _byte_ of _bytes_.
- _wire-byte-array_: _length_ `:` _bytes_ ; The number of bytes in _bytes_
  and the _bytes_.

We do not attempt to capture byte arrays with non-space ASCII characters in the
Presentation Format, but all byte arrays are expressible in the Wire Format.

## Struct

> The name "struct" is tentative.
> https://github.com/ocapn/ocapn/pull/125

A collection of (field name, value) pairs.

In the Presentation Format and Wire Format, no field name may appear more than
once.

In the Wire Format, fields must appear in strictly-ascending bytewise order.

> Examples:
> - `{ a: 10, b: 2 }` corresponds to `{1"a10+1"b2+}`.
> - `{ "a": 10, "b": 2 }` corresponds to `{1"a10+1"b2+}`.
> - `{ 'b: 2, 'a: 10 }` corresponds to `{1'a10+1'b2+}`.

- _presentation-struct_: `{` ( _presentation-field_ ( `,` _presentation-field_ )* )? `}`
- _presentation-field_: _presentation-key_ `:` _presentation-value_
- _presentation-key_: _presentation-field-name_ / _presentation-value_
- _presentation-field-name_: _name_ ; Corresponding to a string.
- _wire-struct_: `{` _wire-field_* `}`
- _wire-field_: _wire-key_ _wire-value_
- _wire-key_: _wire-value_ ; The Wire Format lacks an analog for the
  Presentation Format's string key shorthand.

> The [Model](Model.md) limits field names in structs to strings, but for
> purposes of [CapTP](CapTP%20Specification.md) surrounding data, the notation
> and representation allow any value.

The Presentation Format allows a shorthand where a field name may be an
alphanumeric ASCII name without a prefix `"`, in which case the field name is a
[String](#string).

## List

A list of any quantity of values.

> Example: `[ 1 2 3 ]` corresponds to `[1+2+3+]`.

- _presentation-list_: `[` _presentation-value_ * `]`
- _wire-list_: `[` _wire-value_ * `]` ; The respective Wire Format for the
  Preesentation Format values.

## Record

A tuple of any quantity of values.

> Examples:
> - `<foo 1 2 3>` corresponds to `<3'foo1+2+3+>`
> - `<'foo 1 2 3>` corresponds to `<3'foo1+2+3+>`
> - `<"foo 1 2 3>` corresponds to `<3"foo1+2+3+>`

- _presentation-record_: `<` _presentation-value_ * `>`
- _wire-record_: `<` _wire-field_ * `>`
- _wire-field_: _wire-field-name_ / _wire-value_
- _wire-field-name_: _name_ ; Corresponding to a selector.

> The first value is typically a selector to multiplex the shapes and behaviors
> implied by the record, but may be any value.

The notation allows a shorthand where the first value of a record may be a bare
alphanumeric name without a prefix `'`, in which case he value is a
[Selector](#selector).

> Records do not correspond to a paricular type in the [Model](Model.md), but
> are instrumental in representing messages in the
> [protocol](CapTP%20Specification.md) and envelope many types in the Wire
> Format of the passable data model.
>
> The name "record" does not indicate a relationship to TypeScript records.
> They are more analogous to Python tuples.
