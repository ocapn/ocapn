
This document captures a summary of consensus and remaining contention for the
OCapN data model and abstract syntax, excluding the concern of concrete
representation of these on the wire, but including non-normative
representations in a selection of implementation languages.

Commentary in block quotes is not normative.

> Non-normative commentary.

# Value

A value is any [Atom](#atom), [Container](#container), or [Reference](#reference).

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
- [Error](#error)

References:

- [Target](#target)
- [Promise](#promise)

# Atom

## Undefined

A value representing the absence of a value.

> - **Guile**: `*unspecified*`
> - **JavaScript**: `undefined`
> - **Python**: `None`

## Null (JSON)

A value representing `null` as distinct from `undefined` in JSON.

> - **Guile**: tentatively `json-null` (*imported*)
> - **JavaScript** and **JSON**: `null`
> - **Python**: `Null` (*imported*)
>
> OCapN distinguishes Null from Undefined to hold the invariant that:
> 1. any JSON document that a JavaScript peer can produce using
>   `JSON.stringify`, excluding those that contain any Unicode surrogates,
> 2. can then be read back with `JSON.parse`,
> 3. sent to any other OCapN peer,
> 4. returned from any OCapN peer,
> 5. then saved back to an identical JSON document with `JSON.stringify`.
>
> If OCapN collapsed `null` and `undefined`, passing a JSON document through an
> OCapN connection would have to either choose to omit fields of
> [Struct](#struct)s where the value was `null` or include fields of structs
> where the value was `undefined`.
> Neither choice would produce an identical JSON document under all
> circumstances.
>
> Regarding the preservation of JSON null: https://github.com/ocapn/ocapn/issues/5#issuecomment-826029525

## Boolean (JSON)

A value that is either true or false.

> - **Guile**: `#f`, `#t`
> - **JavaScript** and **JSON**: `false`, `true`
> - **Python**: `False`, `True`

## Integer

An arbitrary precision signed integer.

> - **Guile**: `-1`, `0`, `1`
> - **JavaScript**: `-1n`, `0n`, `1n`
> - **Python**: `-1`, `0`, `1`
>
> Note: We achieved consensus on the name `Integer` at the [November 14, 2023
> meeting](https://github.com/ocapn/ocapn/issues/94).

## Float64 (JSON)

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

## String (JSON\*)

A string of Unicode code points excluding surrogates (U+D800-U+DFFF).
Strings are distinguished from [Selector](#selector) s by type, not content.

> - **Guile**: `""`
> - **JavaScript**: `''`
> - **Python**: `''`
>
> A string's content must be expressible in UTF-8.
> Strings in UTF-16 can express unpaired/lone surrogates that cannot be
> expressed in any UTF and so cannot be carried by OCapN.
>
> \*Strings participate in the JSON subset of OCapN except any strings that
> contain unpaired/lone surrogates.
>
> OCapN cannot send or receive strings that come from a UTF-16 language
> representation (such as a JavaScript string) that contains lone/unpaired
> surrogates.
> Notes: [January 2024 meeting
> notes](https://github.com/ocapn/ocapn/blob/main/meeting-minutes/2024-01-09.md)
> record that we agreed that strings can only be well-formed Unicode, i.e.,
> cannot contain unpaired surrogates.
> For JavaScript, if a string does not pass [the `isWellFormed`
> predicate](https://github.com/tc39/proposal-is-usv-string), then it is not a
> Passable string.
>
> Agoric has agreed to tentatively omit lone surrogates, pending vetting of the
> performance of the implementation in their CapTP.
> https://github.com/ocapn/ocapn/issues/47
>
> Agoric previously held the position that all valid strings that JavaScript
> can parse with `JSON.parse` should round-trip.
> https://github.com/ocapn/ocapn/issues/5#issuecomment-1550370096,
> https://github.com/ocapn/ocapn/issues/5#issuecomment-1550481111
>
> Spritely has consistently preferred a representation that can be captured
> with UTF-8, which cannot transit lone/unpaired surrogates.
> (October 10, 2023)

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
> OCapN uses the name selector to avoid the implication that they will
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

# Container

A container is a value that contains other values.

## List (JSON)

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

## Struct (JSON)

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

## Error

A value capturing the reason for rejecting a delivery.

> - **Guile**: to be proposed
> - **JavaScript**: a JavaScript Error object
> - **Python**: to be proposed
>
> We have not yet converged on any particular details about the modeling of
> errors. The purpose of errors is typically to indicate that some requested
> operation failed. The purpose of the contents of errors is to preserve and
> convey diagnostic information, mostly to help debug problems, such as the
> root cause of a surprising failure. This is a best-efforts obligation, for
> which we have not yet decided either what contents are required, nor what is
> allowed, nor what must be preserved as errors are passed from one site to
> another. Until these details are decided, the only hard requirement is that
> an error round trip to an error. We avoid any interpretation for now as to
> whether it is the "same" error.

# Reference

A value that can receive messages, either a Target or Promise.

## Target

Targets represent either a local value or a remote value.
OCapN can export references to local targets and can import references to
remote targets.
A local target handles deliveries and produces either a return value
(fulfillment) or thrown error (rejection reason) for a message delivery.
A remote target (a presence) forwards messages to its corresponding local target.

> - **Guile**: a procedure
> - **JavaScript**: Tentatively, *far object* (can handle message deliveries
>   locally) or a *presence* (a token object that forwards messages to a
>   corresponding far object).
>   ```js
>   {
>     __proto__: {
>       [Symbol.for('passStyle')]: 'remotable',
>       [Symbol.toStringTag]: allegedInterfaceName,
>     },
>     ...methods
>   }
>   ```
> - **Python**: to be proposed
>
> Tracking: https://github.com/ocapn/ocapn/issues/49

Targets have [Pass Invariant Equality](#pass-invariant-equality).
A target might be sent from a local peer to a remote peer, then the remote peer
may send that target back to the local peer.
The sent target will be equal to the received target.

> The operator for establishing equality is specific to the implementation
> language.
> For JavaScript, the Pass-Invariant Equal operator is `Object.is`.

Although Targets and Promises are both References for delivering messages,
OCapn does not maintain pass invariance for promises.

## Promise

A promise represents the eventual return value (fulfillment) or thrown error
(rejection reason) for a message delivery.

Messages delivered to a promise are forwarded to their eventual fulfillment
value or rejected with the promises's eventual rejection reason.

> - **Guile**: to be proposed
> - **JavaScript**: a JavaScript promise
> - **Python**: to be proposed
>
> Tracking https://github.com/ocapn/ocapn/issues/55

OCapN does not maintain [Pass Invariant Equality](#pass-invariant-equality) for
promises.

# Pass Invariant

> Any property that holds both locally and remotely between a pair of OCapN peers
> during a session is a Pass Invariant.
> For example, for some value types, OCapN maintains invariant that any pair of
> values of that type, if and only if those values are Equal locally, they will
> be equal remotely.
> Furthermore, if the remote peer sends one value back, it will remain equal to
> the value retained locally.

## Pass Invariant Equality

A type holds Equality invariant over passage between OCapN peers if values of that
type can be passed from a local peer to a remote peer, then returned to the local peer,
and the value that was sent is Equal to the value received.

> The operators necessary for checking Equality may vary for each language and even
> for types in one language.
> For example, `Object.is`

