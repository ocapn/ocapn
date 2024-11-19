
This document captures a summary of consensus and remaining contention for the
OCapN data model and abstract syntax, excluding the concern of concrete
representation of these on the wire, but including non-normative
representations in a selection of implementation languages.

Commentary in block quotes is not normative.

> Non-normative commentary.

# Value

A value is any [Atom](#atom), [Container](#container), [Reference](#reference),
or [Error](#error).

Atoms:

- [Undefined](#undefined)
- [Null](#null)
- [Boolean](#boolean)
- [Integer](#integer)
- [Float64](#float64)
- [String](#string)
- [ByteArray](#bytearray)
- [Selector](#selector)

Containers:

- [List](#list)
- [Struct](#struct)
- [Tagged](#tagged)

References:

- [Target](#target)
- [Promise](#promise)

# Atom

Atoms are values that do not contain or refer to other values.

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

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
any [Atom](#atom).

## Null ([JSON](#json-invariants))

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

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
any [Atom](#atom).

## Boolean ([JSON](#json-invariants))

A value that is either true or false.

> - **Guile**: `#f`, `#t`
> - **JavaScript** and **JSON**: `false`, `true`
> - **Python**: `False`, `True`

For purposes of [Pass Invariant Equality](#pass-invariant-equality),
the values True and False are equal only to their respective selves.

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
any [Atom](#atom).

## Integer

An arbitrary precision signed integer.

> - **Guile**: `-1`, `0`, `1`
> - **JavaScript**: `-1n`, `0n`, `1n`
> - **Python**: `-1`, `0`, `1`
>
> Note: We achieved consensus on the name `Integer` at the [November 14, 2023
> meeting](https://github.com/ocapn/ocapn/issues/94).

For purposes of [Pass Invariant Equality](#pass-invariant-equality), every
Integer value is only equal to other Integers with the same magnitude.

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
any [Atom](#atom).

> Notably, Python does not have a reliable identity for every integer, so OCapN
> is not in a position to impose an identity invariant.

## Float64 ([JSON](#json-invariants))

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

OCapN collapses all versions of NaN to a single abstract NaN.

OCapN provides no support for other floating point precisions.

> - **JavaScript**: `NaN`
> - **Guile**: `+nan.0`
> - **Python**: `float('nan')`
>
> Tracking: https://github.com/ocapn/ocapn/issues/58
>
> OCapN round-trips all double precision floating point numbers as expressible with
> IEEE 754, except that OCapN considers all IEEE 754 NaNs as equivalent, i.e., as
> jointly representing a single abstract NaN value. Thus, any concrete NaN representation
> may validly round trip even if it results in a different concrete representation.
> However, we encourage concrete representations to use a canonical NaN representation.
>
> Concretely, the canonical NaN is `0x7ff8\_0000\_0000\_0000`, though this is not
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

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
any [Atom](#atom).

## String ([JSON](#json-invariants)†)

A string of Unicode code points excluding surrogates (U+D800-U+DFFF).
Strings are distinguished from [Selector](#selector) s by type, not content.

> - **Guile**: `""`
> - **JavaScript**: `''`
> - **Python**: `''`
>
> †Strings participate in the [JSON subset](#json-invariants) of OCapN except
> any strings that contain unpaired/lone surrogates.
>
> A string's content must be expressible in UTF-8.
> Some two-byte Unicode encodings, as in JavaScript strings, can contain
> unpaired/lone surrogates that have no valid expression in any UTF and so
> cannot be carried by OCapN.
>
> Notes: [January 2024 meeting
> notes](https://github.com/ocapn/ocapn/blob/main/meeting-minutes/2024-01-09.md)
> record that we agreed that strings can only be well-formed Unicode, i.e.,
> cannot contain unpaired surrogates.
> For JavaScript, if a string does not pass [the `isWellFormed`
> predicate](https://github.com/tc39/proposal-is-usv-string), then it is not a
> Passable string.

For purposes of [Pass Invariant Equality](#pass-invariant-equality), a pair of
Strings are equal if they have the same quantity of Unicode code points and
have the same respective Unicode code points in order.

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
any [Atom](#atom).

## ByteArray

An array of bytes.

> - **Guile**: `#vu8()`
> - **JavaScript**: `new ArrayBuffer()`
> - **Python**: `b''`
>
> Tracking: https://github.com/ocapn/ocapn/issues/48
>
> At the [November 14, 2023](https://github.com/ocapn/ocapn/issues/94) meeting,
> we agreed to settle on the prefix "byte" and agreed to decide at the next
> meeting based on a [reactji
> poll](https://github.com/ocapn/ocapn/issues/48#issuecomment-1811097196).
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

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
any [Atom](#atom).

> Notably, imposing identity invariants for JavaScript ArrayBuffer would put
> an undue performance burden for OCapN sessions, as they would need to intern
> all reachable ByteArrays for the duration of the session and search for
> an equivalent ArrayBuffer for every received ByteArray.

## Selector

A string of Unicode code points excluding surrogates (U+D800-U+DFFF).
Selectors are distinguished from [String](#string)s by type, not content.

> - **Guile**: symbols `'name`
> - **JavaScript**: 
>   ```js
>   {
>     [Symbol.for('passStyle'): 'selector',
>     [Symbol.toStringTag]: 'name',
>   }
>   ```
> - **Python**: `Selector('name')` where `Selector` is imported from `ocapn`.
>
> A selector's content must be expressible in UTF-8.
> Strings in UTF-16 can express unpaired/lone surrogates that cannot be
> expressed in any UTF and so cannot be carried by OCapN.
>
> Tracking: https://github.com/ocapn/ocapn/issues/46
>
> OCapN uses the name Selector to avoid the implication that they will
> correspond to a language's symbol type in all languages that have a symbol
> type.
> Selectors may correspond to symbols in languages where a symbol is elligible
> for garbage collection when there are no extant references.
> At this time, JavaScript cannot safely use registered symbols like
> `Symbol.for('name')` for OCapN selectors, because registered symbols are
> interned without possibility of eventual garbage collection.
>
> OCapN supports one operator for delivering both function application and
> method invocation.
> By convention, method invocation is equivalent to function application, where
> the first argument is a selector followed by the remaining arguments.
>
> However, like symbols in Guile, selectors are values and can appear anywhere
> values appear, including any argument position, inside a container, or as a
> promise fulfillment value or rejection reason.

For purposes of [Pass Invariant Equality](#pass-invariant-equality), a pair of
Selectors are equal if they have the same quantity of Unicode code points and
have the same respective Unicode code points in order.

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
any [Atom](#atom).

# Container

A container is a value that contains other values.

## List ([JSON](#json-invariants))

A list of any quantity of values.

> - **Guile**: `'()`
> - **JavaScript** and **JSON**: `[]`
> - **Python**: `()` (We have not discussed whether to use tuple or list. Tuple
>   is less mutable, though enforcing immutability in Python is not likely to be
>   a goal the way it is in hardened JavaScript.)
>
> Lists participate in the JSON subset of OCapN.
>
> We achieved consensus to name the type "List" at the [November 14, 2023](https://github.com/ocapn/ocapn/issues/94) meeting.

A pair of lists are equal or equivalent for purposes of [Pass Invariant
Equality](#pass-invariant-equality) if the are the same length and every
respective value is equal, transitively.

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
lists.

## Struct ([JSON](#json-invariants))

A struct with unique, unordered string keys and values of heterogeneous type.

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
> A JavaScript object that owns any non-string keys (numbers or symbols) or
> with a prototype other than `Object.prototype cannot be passed as an OCapN
> struct as all such objects are reserved for concrete representations of OCapN
> types.
> The key `Symbol.for('passStyle')` is special and indicates the kind of OCapN
> value the object represents.

A pair of structs are equal or equivalent for purposes of [Pass Invariant
Equality](#pass-invariant-equality) if they mutually posess a value for every
key in the other struct and every respective value is equal to their own,
transitively.

> A pair of structs may be equivalent regardless of the order of appearance of
> fields.
> OCapN implementations will likely sort keys of structs according to code
> points in order in the concrete representation of a struct.

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
any [Container](#container).

## Tagged

A [Value](#value) with a tag.
The value may be any value.
The tag is a string of Unicode code points excluding surrogates (U+D800-U+DFFF).

> OCapN provides a small number of container types with minimal semantics.
> Tags allow protocols to emerge from values annotated to indicate a richer
> variety of semantics.
> Concretely, a list might be differentiated from or hinted to be an ordered
> list, sorted list, or a set of unique values.
>
> - **Guile**: currently a Guile record labeled `'(make-tagged 'tagName 10)` (**imported**)
> - **JavaScript**: an object with the key `Symbol.for('passStyle')` and value
>   `tagged`, with a string tagName and a single `"payload"` field carrying the tagged value.
>   ```js
>   {
>     [Symbol.for('passStyle')]: 'tagged',
>     [Symbol.toStringTag]: 'tagName',
>     payload
>   }
>   ```
> - **Python**: `Tagged('tagName', value)` where `tag` is a `string` and `Tagged` is
>   imported from `ocapn`.
>
> OCapN tagged data have a single value (are not variadic) [November 14, 2023](https://github.com/ocapn/ocapn/issues/94)
>
> What are tagged values for? https://github.com/ocapn/ocapn/issues/52

Tagged values are equal or equivalent for the purposes of [Pass Invariant
Equality](#pass-invariant-equality) if the tag and value are equivalent,
transitively.

OCapN does not impose [Pass Invariant Identity](#pass-invariant-identity) on
any [Container](#container).

# Reference (Capability)

A value that can receive messages, either a Target or Promise.

> References are the Capabilities in the name OCapN ("Object Capability
> Network") that distinguish a Capability Transfer Protocol from mere RPC
> ("Remote Procedure Calls") as they are the basis of
> [Promise Pipelining](https://en.wikipedia.org/wiki/Futures_and_promises#Promise_pipelining).

## Target

Targets represent either a local value or a remote value.
OCapN can export references to local targets and can import references to
remote targets.
A local target handles deliveries and produces either a return value
(fulfillment) or thrown error (rejection reason) for a message delivery.
A remote target (a presence) forwards messages to its corresponding local target.

> - **Guile**: a procedure
> - **JavaScript**: Tentatively and aspirationally, an object with a `function`
>   named `'deliver'`, a property for the the registered `symbol` for
>   `'passStyle'` and the value `'target'`, and a property with for the
>   well-known `symbol` for `toStringTag` and a `string` value with the alleged
>   interface name for the target for
>   diagnostics.
>   ```js
>   ({
>     [Symbol.for('passStyle')]: 'target',
>     [Symbol.toStringTag]: allegedInterfaceName,
>     deliver(...args) {},
>   })
>   ```
> - **Python**: to be proposed
>
> Tracking: https://github.com/ocapn/ocapn/issues/49

Targets have [Pass Invariant Identity](#pass-invariant-identity).
A target might be sent from a local peer to a remote peer, then the remote peer
may send that target back to the local peer.
The sent target will be identical to the received target and no other value.

OCapN does not impose [Pass Invariant Equality](#pass-invariant-equality) on
any [Reference](#reference).

## Promise

A promise represents the eventual return value (fulfillment) or thrown error
(rejection reason) for a message delivery.
A promise is pending until settled with either a fulfillment or rejection reson.
Messages delivered to a promise are forwarded to their eventual fulfillment
value or rejected with the promises's eventual rejection reason.

> - **Guile**: to be proposed
> - **JavaScript**: a JavaScript promise
> - **Python**: to be proposed
>
> Tracking https://github.com/ocapn/ocapn/issues/55

OCapN does not maintain [Pass Invariant Identity](#pass-invariant-identity) nor
[Pass Invariant Equality](#pass-invariant-equality) for promises.

As with all other types, OCapN does maintain [Pass Invariant
Type](#pass-invariant-type) such that a local promise sent to a a remote peer
arrives as a promise, regardless of whether it is pending or settled locally.

OCapN maintains that, if a local promise is sent to a remote peer and then
retuned, either the fulfillment value or the rejection reason of the sent and
received promises will satisfy the pass invariants applicable to their type.

> For example, if the sent promise settles with a fulfillment value that is a
> Target, the sent and received targets will be identical, because Targets
> maintain [Pass Invariant Identity](#pass-invariant-identity).
>
> For another example, if the sent promise settles with a fulfillment value
> that is a Struct, the sent and received structs will be equal, because
> all [Containers](#container) maintain [Pass Invariant
> Equality](#pass-invariant-equality), but the structs may not be identical.
> OCapN doesn't explicitly forbid identity for passed structs, but interning
> structs for the duration of an OCapN session in order to preserve identity
> for all equivalent structs is prohibitively expensive in most languages.

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

A type holds equality invariant over passage between OCapN peers if values of that
type can be passed from a local peer to a remote peer, then returned to the local peer,
and the value that was sent is equal to the value received.

> Equality does not guarantee a unique identity for all equivalent values.

Any pair of values of different types are not equal or equivalent regardless of
their values.

> Only values of the same type can be equivalent, per the equivalence relation
> specified for their common type.

OCapN holds equality invariant for all [Atoms](#atom) and
[Containers](#container) passed between peers.

> In JavaScript, none of `==`, `===`, or `Object.is` are sufficient to compare
> equality of values, but a composite operator that takes the OCapN type for
> every value into account.
> For example, Float64 can be compared by `Object.is`, which preserves the
> distinction between 0 and -0 and non-equivalence of any NaN to any other NaN,

## Pass Invariant Identity

Values of a type have an identity if a value of that type is identical to
itself and no other value.
A type holds identity invariant over passage between OCapN peers if values of that
type can be passed from a local peer to a remote peer, then returned to the local peer,
and the value that was sent is identical the the value received _and identical
to no other value_.

> The operators necessary for checking identify may vary for each language and
> even for types in one language.
> Pass Invariant Identity obliges OCapN to track a value's identity until the value
> becomes unreachable.

OCapN holds identity invariant only for values of type [Target](#target).

OCapN does not hold identity invariant for values of type [Promise](#promise).

OCapN does not guarantee identity is invariant for any values of [Atom](#atom)
or [Container](#container) types.

> Notably, in JavaScript, all Atomc types have trivial Pass Invariant Identity
> except the JavaScript `ArrayBuffer` for an OCapN [ByteArray](#bytearray) and
> the JavaScript object representation of an OCapN [Selector](#selector).
> OCapN does not obligate a JavaScript implementation to intern a single identity
> for all equivalent ByteArrays or Selectors.

# JSON Invariants

OCapN holds invariant that:

- Any JSON document that a JavaScript peer can produce using
  `JSON.stringify`,
- excluding those that contain any Unicode surrogates,
- can then be read back with `JSON.parse`,
- sent to any other OCapN peer,
- returned from any OCapN peer,
- then saved back to an identical JSON document with `JSON.stringify`.

> For this reason, OCapN supports distinct a distinct [Undefined](#undefined)
> and [Null](#null).
> If OCapN coerced `null` to `undefined`, a JSON document like `{"key": null}`
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
> JSON documents are in the range of `JSON.parse(JSON.stringify(x))`, which
> cannot express -0.
> This holds without regard for -0 being in the range of `JSON.parse`,
> including `JSON.parse('-0')`, because of the narrowing behavior of
> `JSON.stringify`.
>
> OCapN does not hold invariant the preservation of arbitrary JSON documents
> through arbitrary JSON implementations in arbitrary langugaes.
