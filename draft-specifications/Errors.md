# Warning: This is a draft specification likely to undergo significant change

In the [ocapn taxonomy](https://github.com/ocapn/ocapn/blob/main/draft-specifications/Model.md), one of the types is `Error`. This document specifies `Error` at the abstract syntax level, i.e., the data model level. The concrete syntax/encoding of an `Error` has yet to be specified, but should be as close as possible to `Struct`.

# Errors

## Supporting definitions

At least for the purposes of this document, we adopt the following definitions

A ***passable*** is any first class ocapn value, i.e., any value that can be passed over an ocapn connection

A ***capability*** is a passable that might convey the ability to sense or cause effects by means other that open containment. For example, a target is a capability. But a struct containing a capability is not itself a capability, even though it also conveys the ability to sense or cause effects. The following ocapn types are capablities.

- target
- promise
- sturdy ref. I list this separately, in case sturdy refs are not classified as targets or promises. Note that the name "sturdy ref" may be changed, but this covers the concept no matter how it is named.

A property is ***pass-invariant*** if is location-independent. For example, for local predicate `P` with passable arguments, if `P(x1, y1)` is true at any peer, then `P(x2, y2)` must be true at any other peer, where `x2` (`y2`) is the result of passing `x1` (`y1`). For example, Endo's pattern matching is pass-invarant. Pass-invariance necessarily relies on round-tripping constraints, and should rely on nothing else. This includes the normal online passing, but also passing by safe-enough out-of-band means, such as stringified capabilities.

An ***identity*** is an unforgeable comparable passable.

  - ***Unforgeable*** generally means that each identity is fresh. At the point of creation, it is distinct from any identity created by anything other than _this_ creation event. At the ocapn level, that means that any peer may only pass identities that it alone has created, or identities that have been previously passed to it.
  - A ***comparable*** is a passable such that two passings of comparables can be compared for [grant matching](https://erights.github.io/erights-org-website/elib/equality/grant-matcher/index.html) equality. This equality test must able be stable and pass-invariant: if `x` and `y` compare equal at any place and time, then they must compare equal at any other place and time. (This is in contrast to the original CapTP equality, which is monotonic and pass-invariant.)
    - A primitive data value, such as a string or number, is a comparable, but it is not an identity since it can be forged. Note that ocapn `symbols` can be forged and compared, even though participating languages may have conflicting meanings internally for a concept they name `symbol`
    - A target is a comparable. Target identity is also fresh, so a target is both a capability and an identity.
    - A promise is not a comparable, even if it is already fulfilled with a comparable.
    - Whether a strudy ref is comparable has yet to be determined.
    - A ***simple container*** such as a struct or list containing only comparables is a comparable
    - An error is a struct-like container but is not a simple container. Even if two errors contain only comparables, they are still not comparable. Errors are also not identities, they cannot be compared for equality.

    The ability to compare comparables may be limited by some notion of "same netwwork", to be standardized outside this document.

    Currently, only targets and possibly sturdy refs have identity. However, it would be sound for ocapn to introduce an identity---a unique unforgeable comparable passable---that is not a capability. Note that an Error is also not Data and not a Capability. Identities and Errors must remain disjoint. IIRC, @mhofman's `Note` (not currently proposed) might be such a non-capabiity identity.

A ***throwble*** is a passable that does not contain capabilities, either directly or indirectly. Errors, defined below, are throwables. Thus, a throwable can only convey information (and possibly identities). It cannot convey the ability to cause or sense effects.

## Breaking promises

  When a promise is broken, the _reason_ why it is broken will typically be an Error, but it must be a throwable. At this level of the ocapn standard, if an attempt is made to break a promise with a non-throwable, the promise must still be broken, but only by a throwable that we have yet to specify.

## Errors, what is revealed

An ocapn `Error` is much like an ocapn `Struct`. An Error contains a set of named fields, where the name of a field is a string, but the value can only be a throwable.

As a concession to Javascript peers, ocapn reserves the following field names:
- `stack`: Must be absent in ocapn so a language binding can populate it locally as it wishes.
- `constructor`: Must be absent in ocapn so a language binding can populate it locally as it wishes.
- `message`: Must be present and must be a string. We recommend that its contents be prose for human (or natural-language processing systems like llms) to help diagnose the problem that caused this error to be created. It should not contain any information that normal (not llm-like) code uses to make decisions. Thus, the author of a message should feel free to improve the wording over time without worry about breaking clients, with the possible exception of testing code.
- `name`: Must be present and must be a string. When Javascipt talks to Javascript naturally, the `name` is expected to be an error class name (a Javascript concept), but may be a name the receiving side does not associate with an existing class. Unlike `message` we expect code will make decisions based on the contents of `name`.

These reservation fit with the ocapn standards process principle that we _may_ allow concessions to specific languages if
- without the concession, the pain to users of that language would be high
- with the concession, the pain to users of other early participating languages would be low.

We added "early" above to acknowledge the reality that once a concession has become entrenched, it may be impossible to revise to accomodate the pain of a later participant, even if their pain would be high. This is also a tradeoff to be considered by the ocapn standards process in a case-by-case manner.

How high and how low for any particular case is a tradeoff to be considered by the ocapn standards process in a case-by-case manner. Ocapn already contains many such tradeoffs, such as the existence of ocapn `undefined` and ocapn `symbols`. These are concessions to Javascript and Spritely, respectively.

The following names are ***not*** reserved even though they have pre-existing meaning in Javascript. We do not need to reserve them because their expected contents and use are compatible enough with the ocapn rules for non-reserved error fields. Even though we do not separately standardize them, other peers that interoperate with Javascript may wish to be aware of their meaning in Javascript
  - `code` A primitive value, typically a string or number, that provides a finer grain taxonomy of kinds of errors than `name`. Programs can legitimately use the value of `code` to make decisions. Better is the (`name`, `code`) pair, where the value of `name` is the high-order portion and the value of `code` the low order portion. At the time of this writing, `code` is already in widespread use. It is also a proposal before tc39 but not yet an official part of Javascript.
  - `cause` IIUC, a prior error that caused this one. For example, an intermediate level of abstraction may have caught the prior error and then rethrown the wrapping error with additional diagnostic information more relevant to the higher level callers.
  - `errors` Introduced by Javascript's `AggregateError` when a set of prior errors together should result in the throwing of one error.
  - `error` Like `cause`, it is a single prior error. Unlike `cause`, in Javascript it was introduced to support one kind of error, the `SupercededError` error (TODO check if this is the correct name).
  - `superceded` (TODO check if this is the correct name), also introduced by `SupercededError`.

  The round-tripping requirement is that ocapn errors must preserve all revealed information (with the possible exception of `message`). If a peer does not round trip all this information, it is not a conformant ocapn implementation. This round tripping requirement applies across language bindings, so an error containing information expected by language X but not Y must still round trip through Y. This resembles the round tripping constraints on `Tagged`. For example, a Javascript language binding built before the introduction of `FooError` must still round trip the `name: FooError` field so more recent peers can comminicate FooErrors through old intermediaries without loss.

  Similarly, the round-tripping requirement also means, for example, that a Javascript peer must preserve the throwable values of non-reserved fields even when those values violate Javascript expectations.

## Errors, what is hidden

As with any information passed over ocapn, a peer should only pass information that the receiving peer should be allowed to know without any further gating condition. This is worth reiterating for ocapn errors specifically because, for many participating languages including Javascript, it is natural for native errors to convey information that should not be shared so easily.

Some of that information, like the call stack, is important for diagnosing problems, and so should be locally associated with the error to enable selective revelation. Someone who received an error and who the sending peer trusts to see this hidden information should be able to look it up for an error they received, given helpful participation of the sending peer.

We say "sending peer" rather than "originating peer" above because of the mechanics of that lookup. Ocapn does not include in the explictly passed information about an error any keying information that would enable such a lookup. Rather, we recommend that each peer simply count errors passed in each direction for each session. This enables the use of session identifier plus count to be used as keying material for looking up the *passing of* an error. Consistent with our stance that errors are not comparables, there is no non-gated way for a receiving peer to reliably determine if two passings of an error are the "same" error, i.e., are associated with the same hidden information. Likewise, they cannot reliably determine where the error originated. This can only be reconstructed end-to-end, with access control at each step.

Since ocapn does wish to enable cross-peer debugging tools, such as Causeway, a higher-level ocapn standard is likely to standardize what this hidden information is.
- `stack` is the most obvious, which is why ocapn mandates its absence.
- `message` is trickier. The path of least resistance for the author would be to include diagnostic info that should not be revealed without additional access control. Indeed, all pre-Endo Javascript code does this. Endo contains an error/assert subsystem where an error author includes in the passed error only redacted `message`, as if a black pen had struck out pieces of the message that should not generally be revealed. The full unredacted `message` text is of course useful to diagnose what went wrong, and so Endo includes it in the hidden error information.

Such a higher level standard may be the API of a particular target.

We abide by the normal language dictum that errors typically take the slow path whereas normal non-erroneous execution should take the fast path. In other words, much of the engineering around errors may be somewhat inefficiant. But non-erroneous execution should pay only minor costs to accommodate the possibility of errors that don't happen. This applies to causality tracking of asyncronous message sending, promise resolution, and errors.

Not necessarily restricted to errors, we expect similarly hidden information about the inter-turn causation per message send, enabling a cross-peer reconstruction to determine that a message sent at this stack of this turn of this particular peer caused that turn of that particular peer. Ideally, this causality info would be maintained for all message sendings, or at least all cross-peer message sending. The latter would use the same counting trick since ocapn does not include a message identifier in a passed message.

However, due to efficiency issues, some peers may not persistently store this information for all messages, but only for message that caused errors. These might be ephemerally stored in a low overhead fifo queue. Thus, there may be a horizon to the depth of the queue for message-causality info significantly older than the passing of the error. Thus, causality that did not cause an error, as well as causality that fell off the horizon, make may be impossible to reconstruct. By the same token, when sampling stacks is expensive, the call stack at which a message was sent may be absent, even if other causality information such the turn count is recorded.

Note that any peer that is deterministically replayable can track causality at even lower overhead, in that instrumented replay can reconstruct all causality starting from a replay base. The production play would not be so instrumented, and so would not need to do any of this tracking itself. Both Spritely and the Agoric use of Endo on chain are deterministically replayable, though Agoric does reconstruct causality by replay at this time.

Since this document does not standardize anything about that higher level, this "what is hidden" section is merely suggestive.

# Summary

An Error will typically be split into its revealed information and its hidden information, to enable separate access control on access to hidden information. This level of the ocapn spec is concerned only about revealed information, since that is all that is passed over ocapn. The revealed portion of an Error is much like a Struct, except
- Some field names are reserved, currently four.
- The field values cannot contain capabilities, like Targets or Promises.
- An Error is not a Capability.
- Errors cannot be compared for equality
