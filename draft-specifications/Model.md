
This document captures a summary of consensus and remaining contention for the
OCapN data model and abstract syntax, excluding the concern of concrete
representation of these on the wire, but including non-normative
representations in a selection of implementation languages.

Commentary in block quotes is not normative.

> Non-normative commentary.

# Value

A value is any [Atom](#atom), [Container](#container),
[Reference](#reference-capability), or [Error](#error).

Atoms:

- [Undefined](#undefined)
- [Null](#null)
- [Boolean](#boolean)
- [Integer](#integer)
- [Float64](#float64)
- [String](#string)
- [ByteArray](#bytearray)
- [Symbol](#symbol)

Containers:

- [List](#list)
- [Struct](#struct)
- [Tagged](#tagged)

References:

- [Target](#target)
- [Promise](#promise)

# Atom

Atoms are values that cannot contain or refer to other values.

## Undefined

A value representing the absence of a value.

> - **Guile**: `*unspecified*`
> - **JavaScript**: `undefined`
> - **Python**: `None`

If a JavaScript implementation of OCapN receives a [Struct](#struct) with an
Undefined value for some key, the struct must be represented as an object
that owns a property with the value `undefined` for that key.

> Consequently, `JSON.stringify` for the same OCapN struct will omit the
> property from the generated JSON object.

For purposes of [Pass Invariant Equality](#pass-invariant-equality),
there is only one Undefined value and it is equal to itself.

## Null

([JSON](#json-invariants))

A value representing `null` as distinct from `undefined` for the purpose
of maintaining [JSON Invariants](#json-invariants).

> - **Guile**: tentatively `json-null` (*imported*)
> - **JavaScript** and **JSON**: `null`
> - **Python**: `Null` (*imported*)

If a JavaScript implementation of OCapN receives a [Struct](#struct) with
a Null value for some key, the struct must be represented as an object
that owns a property with the value `null` for that key.

> Consequently, `JSON.stringify` for the same OCapN struct will have
> a property with the value `null` in the generated JSON object.

For purposes of [Pass Invariant Equality](#pass-invariant-equality),
there is only one Null value and it is equal to itself.

## Boolean

([JSON](#json-invariants))

A value that is either true or false.

> - **Guile**: `#f`, `#t`
> - **JavaScript** and **JSON**: `false`, `true`
> - **Python**: `False`, `True`

For purposes of [Pass Invariant Equality](#pass-invariant-equality),
the values True and False are equal only to their respective selves.

## Integer

An arbitrary precision signed integer.

> - **Guile**: `-1`, `0`, `1`
> - **JavaScript**: `-1n`, `0n`, `1n`
> - **Python**: `-1`, `0`, `1`
>
> Note: We achieved consensus on the name `Integer` at the
> [November 14, 2023 meeting]
> (https://github.com/ocapn/ocapn/blob/main/meeting-minutes/2023-11-14.md).

For purposes of [Pass Invariant Equality](#pass-invariant-equality), every
Integer value is only equal to Integer values that represent the same
arithmetic integer.

## Float64

([JSON](#json-invariants))

An IEEE 754 64-bit floating point number.

OCapN preserves the distinction between +0 and -0.

| Language       | Negative | Positive |
|----------------|---------:|---------:|
| **Guile**      | `-0.0`   | `0.0`    |
| **JavaScript** | `-0`     | `0`      |
| **Python**     | `-0.0`   | `0.0`    |

OCapN preserves positive and negative infinity.

| Language       | Negative        | Positive       |
|----------------|----------------:|---------------:|
| **Guile**      | `-inf.0`        | `+inf.0`       |
| **JavaScript** | `-Infinity`     | `Infinity`     |
| **Python**     | `float('-inf')` | `float('inf')` |

OCapN collapses the complete set of NaN values to a single abstract NaN.

OCapN provides no support for other floating point precisions.

> - **Guile**: `+nan.0`
> - **JavaScript**: `NaN`
> - **Python**: `float('nan')`
>
> Tracking: https://github.com/ocapn/ocapn/issues/58
>
> OCapN round-trips all floating point numbers representable within IEEE 754
> binary64, except that OCapN considers all NaNs as equivalent, that is, as jointly
> representing a single abstract NaN value.
> So, any concrete NaN representation may validly round trip even if it results
> in a different concrete representation.
> However, we encourage use of a canonical representation for NaN.
>
> Concretely, the canonical NaN is `0x7ff8_0000_0000_0000`, though this is not
> a concern of the abstract syntax and data model.
>
> All real and finite double precision floating point numbers participate in the
> JSON subset of OCapN.
> We expect OCapN-compatible JSON codecs, including the JavaScript `JSON` codec,
> to round-trip all numbers except NaNs, infinities, and negative zero, but all
> other numbers expressible with an IEEE 754 double-precision float to survive a
> round trip without loss of precision.
> We also do not expect integers expressed with higher precision in JSON to
> survive a round-trip through an OCapN-compatible JSON codec.
>
> Consensus on preserving -0:
> - As of May 16, @erights insisted that -0 round trip to 0 https://github.com/ocapn/ocapn/issues/5#issuecomment-1550020450
> - On May 23, @zenhack proposed preserving -0 https://github.com/ocapn/ocapn/issues/5#issuecomment-1560116857
> - We converged out of band and Agoric has committed to preserving -0 https://github.com/endojs/endo/issues/1602

For purposes of [Pass Invariant Equality](#pass-invariant-equality):
- Every finite Float64 is equal to any other Float64 with the same bitwise
  representation.
- Every infinite Float64 is equal to any other infinite Float64 of the same
  sign.
- There is only one NaN value and it is equal to itself.

> JavaScript's `Object.is` is consistent with Pass Invariant Equality, whereas
> `==` and `===` are not.

## String

([JSON](#json-invariants)†)

A sequence of Unicode code points excluding surrogates (U+D800-U+DFFF).
Strings are distinguished from [Symbols](#symbol) by type, not content.

> - **Guile**: `""`
> - **JavaScript**: `''`
> - **Python**: `''`
>
> †Strings participate in the [JSON subset](#json-invariants) of OCapN except
> any strings that contain surrogate code points.
>
> A string's content must be expressible in UTF-8.
> Some two-byte Unicode encodings, as in JavaScript strings, can contain
> 16-bit surrogate code _units_ in the range from 0xD800-0xDFFF.
> Pairs of surrogate code units correspond to a single Unicode code _point_
> greater than or equal to U+10000 and can be expressed in UTF-8.
> However unpaired or lone surrogates have no valid expression in any UTF
> and so cannot be carried by OCapN.
>
> Notes: [January 2024 meeting
> notes](https://github.com/ocapn/ocapn/blob/main/meeting-minutes/2024-01-09.md)
> record that we agreed that strings can only be well-formed Unicode, that is,
> cannot contain unpaired surrogate code points.
> For JavaScript, if a string does not pass [the `isWellFormed`
> predicate](https://github.com/tc39/proposal-is-usv-string), then it is not a
> Passable string.

For purposes of [Pass Invariant Equality](#pass-invariant-equality), a pair of
Strings are equal if they have the same quantity of Unicode code points and
have the same respective Unicode code points in order.

## Symbol

A sequence of Unicode code points excluding surrogates (U+D800-U+DFFF).
Symbols are distinguished from [String](#string)s by type, not content.

> - **Guile**: symbols `'name`
> - **JavaScript**: an object with two own properties:
>   for the registered symbol key `passStyle`, the value is the string
>   `symbol`; and
>   for the well-known symbol `toStringTag`, the value is a string consisting
>   of the code points of the symbol.
>   ```js
>   ({
>     [Symbol.for('passStyle')]: 'symbol',
>     [Symbol.toStringTag]: 'name',
>   })
>   ```
> - **Python**: `Symbol('name')` where `Symbol` is imported from `ocapn`.
>
> A symbol's content must be expressible in UTF-8.
> Some two-byte Unicode encodings, as in JavaScript strings, can contain
> 16-bit surrogate code _units_ in the range from 0xD800-0xDFFF.
> Pairs of surrogate code units correspond to a single Unicode code _point_
> greater than or equal to U+10000 and can be expressed in UTF-8.
> However unpaired or lone surrogates have no valid expression in any UTF
> and so cannot be carried by OCapN.
>
> Tracking: https://github.com/ocapn/ocapn/issues/46
>
> OCapN uses the name Symbol to avoid the implication that they will
> correspond to a language's symbol type in all languages that have a symbol
> type.
> Symbols may correspond to symbols in languages where a symbol is eligible
> for garbage collection when there are no extant references.
> At this time, JavaScript cannot safely use registered symbols like
> `Symbol.for('name')` for OCapN symbols, because some implementations intern
> registered symbols without possibility of eventual garbage collection.
>
> OCapN supports one operator for delivering both function application and
> method invocation.
> By convention, method invocation is equivalent to function application, where
> the first argument is a symbol followed by the remaining arguments.
>
> However, like symbols in Guile, symbols are values and can appear anywhere
> values appear, including any argument position, inside a container, or as a
> promise fulfillment value or rejection reason.

For purposes of [Pass Invariant Equality](#pass-invariant-equality), a pair of
Symbols are equal if they have the same quantity of Unicode code points and
have the same respective Unicode code points in order.

## ByteArray

An array of 8-bit bytes.

> - **Guile**: `#vu8()`
> - **JavaScript**: `new ArrayBuffer()`
> - **Python**: `b''`
>
> Tracking: https://github.com/ocapn/ocapn/issues/48
>
> At the [November 14, 2023]
> (https://github.com/ocapn/ocapn/blob/main/meeting-minutes/2023-11-14.md)
> meeting, we agreed to settle on the prefix "byte" and agreed to decide at the
> next meeting based on a [reactji poll]
> (https://github.com/ocapn/ocapn/issues/48#issuecomment-1811097196).
>
> [January 2024 meeting
> notes](https://github.com/ocapn/ocapn/blob/main/meeting-minutes/2024-01-09.md)
> record that we agreed on ByteArray because it was the winner of the poll, and
> we had already agreed to resolve this specific issue by poll among these
> three choices.
>
> The JavaScript representation of a ByteArray is an `ArrayBuffer` which may
> be made immutable with the proposed JavaScript [Immutable
> ArrayBuffer](https://github.com/tc39/proposal-immutable-arraybuffer) feature.

For purposes of [Pass Invariant Equality](#pass-invariant-equality), a pair of
ByteArrays are equal if they have the same quantity of bytes and have the same
respective bytes in order.

# Container

A container is a value that contains other values.

## List

([JSON](#json-invariants))

A list of any quantity of values.

> - **Guile**: `'()`
> - **JavaScript** and **JSON**: `[]`
> - **Python**: `()` (We have not discussed whether to use tuple or list. Tuple
>   is less mutable, though enforcing immutability in Python is not likely to be
>   a goal the way it is in hardened JavaScript.)
>
> Lists participate in the JSON subset of OCapN.
>
> We achieved consensus to name the type "List" at the [November 14, 2023]
> (https://github.com/ocapn/ocapn/blob/main/meeting-minutes/2023-11-14.md)
> meeting.

A pair of lists are equal or Equal for purposes of [Pass Invariant
Equality](#pass-invariant-equality) if they are the same length and every
respective value is equal, transitively.

## Struct

([JSON](#json-invariants))

> The name "struct" is tentative.
> https://github.com/ocapn/ocapn/pull/125

A collection of unordered (key, value) pairs.
Each key must be a [String](#string), and must be
non-[Equal](#pass-invariant-equality) to any other key within a Struct.
[Values](#value) within a Struct may be of heterogeneous type.

> - **Guile**: `make-tbd-hash` a hash of undecided type
> - **JavaScript**: `{}`
> - **Python**: `{}`
>
> For the purposes of surviving a round trip, the order of appearance of
> entries in the struct must not be important for determining equivalence.
> A struct representation concretely using one key order may validly
> round-trip into a struct representation using another key order.
> However, we encourage concrete representations to use some canonical key
> order, though this is not a concern of the abstract syntax and data model.
>
> A JavaScript object that owns any symbol-keyed properties or uses a prototype
> other than `Object.prototype` cannot be passed as an OCapN struct.
> The key `Symbol.for('passStyle')` is special and indicates the kind of OCapN
> value the object represents.

A pair of structs are Equal for purposes of [Pass Invariant
Equality](#pass-invariant-equality) if they mutually posses a value for every
key in the other struct and every respective value is equal to their own,
transitively.

> A pair of structs may be Equal regardless of the order of appearance of
> fields.

## Tagged

A pair consisting of a tag and a [Value](#value).
The tag must be a [String](#string).

> OCapN provides a small number of container types with minimal semantics.
> Tags allow protocols to emerge from values annotated to indicate a richer
> variety of semantics.
> For example, an arbitrary-precision decimal number might be represented as a
> Tagged with a tag of "decimal" and a value that is a decimal
> [String](#string) such as "3.14" (or alternatively, a value that is a
> two-element [List](#list) of significand and decimal exponent
> [Integers](#integer) such as [314, -2]).
>
> - **Guile**: currently a Guile record labeled `'(make-tagged 'tagName 10)` (**imported**)
> - **JavaScript**: an object with three own properties:
>   for the registered symbol key `passStyle`, the value is the string `tagged`;
>   for the well-known symbol key `toStringTag`, the value is the tag;
>   for the string key `payload`, the value is the tagged value.
>   ```js
>   ({
>     [Symbol.for('passStyle')]: 'tagged',
>     [Symbol.toStringTag]: 'tagName',
>     payload
>   })
>   ```
> - **Python**: `Tagged('tagName', value)` where `tag` is a `string` and `Tagged` is
>   imported from `ocapn`.
>
> OCapN tagged data have a single value (are not variadic) [November 14, 2023]
> (https://github.com/ocapn/ocapn/blob/main/meeting-minutes/2023-11-14.md)
>
> What are tagged values for? https://github.com/ocapn/ocapn/issues/52

Tagged values are equal or Equal for the purposes of [Pass Invariant
Equality](#pass-invariant-equality) if the tag and value are Equal,
transitively.

# Reference (Capability)

A value that can receive messages, either a Target or Promise.

> References are the Capabilities in the name OCapN ("Object Capability
> Network") that distinguish a Capability Transfer Protocol from mere RPC
> ("Remote Procedure Calls").
> References forward messages and support
> [Promise Pipelining](https://en.wikipedia.org/wiki/Futures_and_promises#Promise_pipelining).

## Target

Targets represent either a local value or a remote value.
OCapN can export references to local targets and can import references to
remote targets.
A local target handles deliveries and produces either a return value
(fulfillment) or thrown error (rejection reason) for a message delivery.
A remote target (a presence) forwards messages to its corresponding local target.

> - **Guile**: a procedure
> - **JavaScript**: to be proposed
> - **Python**: to be proposed
>
> Tracking: https://github.com/ocapn/ocapn/issues/49

Targets have [Pass Invariant Equality](#pass-invariant-equality).
A target might be sent from a local peer to a remote peer, then the remote peer
may send that target back to the local peer.
The sent target will be equal to the received target and no other value.

## Promise

A Promise represents the eventual return value (fulfillment) or thrown error
(rejection reason) for a message delivery.
A Promise is pending until settled with either a fulfillment or rejection
reason.
OCapN queues messages delivered to a Promise.
If the eventual resolution of a Promise is another Promise, OCapN forwards
the queued messages to the next Promise.
If the eventual fulfillment value of the Promise is a Target, OCapN forwards
the queued messages to the Target.
OCapN does not forward messages to non-references (non-capabilities).

> - **Guile**: to be proposed
> - **JavaScript**: a JavaScript promise
> - **Python**: to be proposed
>
> Tracking https://github.com/ocapn/ocapn/issues/55

OCapN does not maintain [Pass Invariant Equality](#pass-invariant-equality) for
promises.

As with all other types, OCapN does maintain [Pass Type Invariance]
(#pass-type-invariant) such that a local promise sent to a a remote peer
arrives as a promise, regardless of whether it is pending or settled locally.

OCapN maintains that, if a local promise is sent to a remote peer and then
returned, either the fulfillment value or the rejection reason of the sent and
received promises will satisfy the pass invariants applicable to their type.

> For example, if the sent promise settles with a fulfillment value that is a
> Target, the sent and received targets will be equal, because Targets
> maintain [Pass Invariant Equality](#pass-invariant-equality).
>
> For another example, if the sent promise settles with a fulfillment value
> that is a Struct, the sent and received structs will be equal, because all
> [Containers](#container) maintain [Pass Invariant
> Equality](#pass-invariant-equality).

# Error

A value capturing the reason for rejecting a delivery.

> - **Guile**: to be proposed
> - **JavaScript**: a JavaScript Error object
> - **Python**: to be proposed
>
> We have not yet converged on consensus for any particular details about the
> modeling of errors. The purpose of errors is typically to indicate that some
> requested operation failed. The purpose of the contents of errors is to
> preserve and convey diagnostic information, mostly to help debug problems,
> such as the root cause of a surprising failure. This is a best-efforts
> obligation, for which we have not yet decided either what contents are
> required, nor what is allowed, nor what must be preserved as errors are
> passed from one site to another. Until these details are decided, the only
> hard requirement is that an error round trip to an error. We avoid any
> interpretation for now as to whether it is the "same" error.
>
> https://github.com/ocapn/ocapn/issues/142

# Pass Invariant

> Any property that holds for corresponding values both locally and remotely
> between a pair of OCapN peers during a session is a Pass Invariant.

## Pass Type Invariant

All values passable between OCapN peers have a single, invariant type.
A value sent from one peer and received in another will have the same OCapN
type in both peers.
For any value sent from a local peer to a remote peer then returned to the
local peer, the sent and received values will have the same type.

## Pass Invariant Equality

OCapN defines a flavor of equality, nominally Equality.
Two values may be Equal under Equality.
Values of different OCapN types are not Equal.
Values of the same OCapN type may be Equal under conditions specific to their
shared type.
All OCapN types maintain pass invariant Equality except Promise and
(tentatively) Error.

All OCapN implementations, regardless of language, must model all OCapN types
such that Equality for the in-language representation of values is consistent
with the Equality and Pass Invariance of Equality for their corresponding OCapN
model type.

A type holds Equality invariant over passage between OCapN peers.
Any pair of local values that are Equal can be passed to another peer and the
respective remote values will also be Equal.

It follows that, for any local value that is sent over OCapN, if that value
returns to the local peer through any path through the network of remote peers,
the sent and received values will be Equal.

> OCapN Equal values may be locally distinguishable by other operators
> depending on the language implementation and type.

> In JavaScript, none of `==`, `===`, or `Object.is` are sufficient to compare
> Equality of values, which instead must take into account the OCapN type for
> each value.
> For example, Float64 can be compared by `Object.is`, which preserves the
> distinction between 0 and -0 and lack of distinction between any two NaN
> values.
> `Object.is` is also sufficient for Target provided that the OCapN
> implementation holds invariant a single object identity for every Target.
> The JavaScript ArrayBuffer representation of an OCapN ByteArray must be
> compared byte-for-byte.
> Also, `Object.is` is not sufficient for Container because container
> equality is based on recursive equality of the contents.

# JSON Invariants

OCapN holds invariant that:

- Any JSON text that a JavaScript peer can produce using
  `JSON.stringify`,
- excluding those in which the Unicode representation of any object member name
  or string includes a surrogate code point,
- can then be read back with `JSON.parse`,
- sent to any other OCapN peer,
- returned from any OCapN peer,
- then saved back to an equivalent JSON text with `JSON.stringify`.

> For this reason, OCapN supports a distinct [Undefined](#undefined)
> and [Null](#null).
> If OCapN coerced `null` to `undefined`, a JSON text like `{"key": null}`
> would become `{"key": undefined}` passing through an OCapN network, and
> consequently reduce to `{}` when returned to JSON format with
> `JSON.stringify`.
> If OCapn coerced `undefined` to `null`, an idiomatic JavaScript options
> object like `{"key": undefined}` would return through the OCapN network as
> `{"key": null}` and would `key` would no longer pass `key === undefined`
> checks.
> If OcapN refused to pass documents with either `null` or `undefined`, OCapN
> would have too great an impedence mismatch with either idiomatic JSON
> documents or idiomatic use of JavaScript objects.
>
> OCapN maintains that -0 and 0 are distinct [Pass Invariant](#pass-invariant)
> values, whereas JavaScript's `JSON.stringify` renders -0 as `0`.
> This is consistent with OCapN's JSON Invariants because all pass-invariant
> JSON texts are in the range of `JSON.parse(JSON.stringify(x))`, which
> cannot express -0.
> This holds without regard for -0 being in the range of `JSON.parse`,
> including `JSON.parse('-0')`, because of the narrowing behavior of
> `JSON.stringify`.
>
> OCapN does not hold invariant the preservation of arbitrary JSON texts
> through arbitrary JSON implementations in arbitrary languages.
