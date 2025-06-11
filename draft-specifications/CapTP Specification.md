# Warning: This is a draft specification likely to undergo significant change

This draft specification has been initially written based on Spritely Goblin's
implementation of CapTP as a base for the
[OCapN pre-standardization group](https://ocapn.org) to work from. Over
time this document will change, likely significantly as the group converges on
the design of CapTP. If you're interested in being part of that work, please
join!

Authors: Jessica Tallon, Christine Lemmer-Webber, Mark Miller & The OCapN
Pre-standardization Group.

# [Introduction](#introduction)

Capability Transport Protocol (CapTP) is a secure messaging protocol designed
for communication between objects in distributed systems across networks. By
utilizing a capability security model, CapTP ensures both security and
functionality without compromise. In this model, an object can use
another object (capability) if and only if it possesses a reference to
it. In other words, "if you don't have it, you can't use it."

CapTP offers several valuable features, including:

- Powerful promises and promise pipelining, allowing remote value usage before
  resolution.
- Error propagation across the network.
- Distributed garbage collection.
- Secure third-party handoffs, even when CapTP messages are not kept secret.

CapTP is built upon the foundation of the actor model, where each actor is
referred to as an object. An actor model is a system where objects pass messages
between one another. CapTP enables objects to have remote references to other
objects on other CapTP sessions, often on different machines across the network.
An object Alice with a reference to another object Bob can use that reference by
sending a message to Bob or by sharing the reference to Bob in a message to
another object.

With the right tooling, many programming languages implementing CapTP can
achieve the same semantics of asynchronous programming for invoking both local
and remote objects, allowing programmers to focus on code flow rather than
networking infrastructure.

# Additional Documents

This document does not stand alone, it relies upon multiple other documents
which together build up OCapN (Object Capability Network) specifications.

This specification uses the following other specifications:

-   [Syrup](https://github.com/ocapn/syrup): The serialization format used for all messages between actors
    separated by a CapTP boundary.
-   [OCapN Netlayers](./Netlayers.md): Specification to open a secure communication channel
    between two sessions, often on different networks.
-   [OCapN Locators][Locators]: Specification covers representation of object references
    for both in-band and out-of-band usage.

# CapTP Overview

A CapTP session consists of two entities exchanging CapTP messages over a
reliable, in-order OCapN Netlayer channel (details of which are specified in the
OCapN Netlayer specification).

Here's an overview of some things which may occur during a CapTP session:

1. A session is established pairwise between two peers.
2. Communication occurs between objects.
    -   Initial connectivity to objects is established by querying the bootstrap
        object for access to known objects (via sturdyrefs or certificates).
    -   Messages are exchanged between objects which hold references to each
        other.
    -   Promises may be created when messages are sent.
    -   Messages may be pipelined to promises, queueing those messages to
        eventually be delivered to their resolution.
    -   Handoffs are initiated when sending a message with a reference to an
        object outside of the CapTP session.
    -   Both parties cooperate to free object references which are recognized to
        no longer be needed on at least one side
5.  A session ends.

## Establishing a connection

A new connection is established either by:

- Using an out-of-band mechanism to bootstrap the connection
- Performing a third party handoff

In either situation, a secure channel needs to be created to the endpoint.
This is out of scope for this specification but it's covered by the OCapN
Netlayers specification. Once a secure channel is established, each side
MUST perform the following steps in order:

1.  Create a per-session cryptography key pair (see
    [Cryptography](#cryptography))
2.  Send a [`op:start-session`](#opstart-session) message
3.  Receive and verify the remote endpoints's
    [`op:start-session`](#opstart-session)
4.  Export the bootstrap object at position `0`.

Once these steps are successfully completed, the connection is considered
established and set up, and can be used to send and receive messages with remote
objects.

## Sending and receiving messages

When an object sends a message to another object across a CapTP boundary, it
either expects a reply or not. If the object expects a reply, it sends a
[`op:deliver`](#opdeliver) message containing a [promise](#promises)
representing the reply. Otherwise, it sends a [`op:deliver-only`](#opdeliver-only)
message. Messages can also be "pipelined" to promises generated by message
sends with `op:deliver`, eliminating the need for unnecessary round-trips
via [Promise Pipelining](#promise-pipelining).

This covers the basic usage of CapTP. Another aspect that can occur when sending
messages through CapTP is when an object sends a message that includes a
reference to an object residing in a different session. To perform this while
maintaining the security provided by CapTP, it is necessary to perform a
[Third Party Handoff](#third-party-handoffs).

It is conventional, but not required, that some objects may offer different
behavior depending on a "method". The method is conventionally a symbol whose
value is the name of the method/behavior. This symbol is the first argument in a
message, and the remaining arguments are the message sent to that behavior. This
convention is followed for the CapTP bootstrap object and for promises.

## Ending a session

Finally, a session may end due to an unrecoverable error or because
either side wishes to end it. Both situations are covered by the
[`op:abort`](#opabort) message. When this is received the session
should be severed and unresolved promises broken.

# Promises

Promises are a key part of CapTP. They are used to represent a value which is
not yet known. Promises without a value are said to be unresolved, they can
become resolved by being `fulfill`ed with a value (including another promise),
or broken (`break`) with an error.

Promises are often created by sending an `op:deliver` message, where they
represent the eventual value of the response. They can be chained together in
what is called [Promise Pipelining](#promise-pipelining), whereby messages are
sent to the promise which should be delivered to its resolution value if it is
fulfilled with a single (as opposed to breaking with an error, or fulfilled with
multiple values).

## [Promise and Resolver Objects](#promise-objects)

Promises work like regular objects in CapTP. Promises come as a pair:

- The promise object itself which represents a value.
- The resolver object which is used to provide the promise with its resolved
  value, or break it in the case of an error.

 The promise object may eventually resolve to either a concrete value, object
 reference, another promise (in the case of promise pipelining), or may break.
 When a promise breaks its resolved with an error, breakages can be caused by
 either explicit instruction, by implicit error propagation, or network
 partition.

Promises can be listened to with the [`op:listen`](#oplisten) operation, or
messages can be sent to them as if it were the resolved object. The messages
will be relayed to the eventual object if it is `fulfill`ed to one. If the
promise instead `break`s and thus has no resolved object, messages cannot be
delivered and promises created during the sending of those messages should also
break.

The behavor of the two messages on the resolver object are as follows:

- `fulfill`: Provide the promise with its fulfillment values (success case)
- `break`: Breaks the promise (usually due to an error)

### `fulfill`

This method takes exactly one argument, the fulfillment value for the promise.
The value may be any passable value.

### `break`

Break takes a single argument, a value that represents an error that occured.
This error should be delivered to any listeners of the promise.

**NOTE:** The value of errors transmitted over CapTP is up to the transmitting
party. However, including the contents of exception objects or debugging
information such as backtraces could unintentionally leak sensitive information.
It may be valuable at a CapTP border to strip certain kinds of debugging
information, to encrypt its contents, or to use the sealer/unsealer pattern from
capability literature to secure its contents so that only parties with the
relevant sealers/unsealers can safely decode them.

## [Promise pipelining](#promise-pipelining)

When an [`op:deliver`](#opdeliver) message is sent and a result is pending, it
is often desirable to use this result. One way to do this would be to wait until
the promise has been resolved and then send the next message to the result.
While this approach can be taken within OCapN, promise pipelining is preferred.
When a message is sent with an `answer-pos` specified, the promise on the remote
session can then be referenced and messaged with the
[`desc:answer`](#desc-answer) descriptor. When a promise is fulfilled to an
object, messages sent to the promise will be delivered to that object.

### Promise pipelining by example

In this example we send an initial message to the object exported at position
`5` (a factory builder) and tell the remote session to export the promise at
answer position `3` (a car factory), then we send a message to the promise at
that answer position to make a car and export it at answer position `4`, finally
we send a message to the promise of a car at answer position `4` to drive it.

The messages delivered are as follows:

```
<op:deliver <desc:export 5> ['make-car-factory] 3 <desc:import-object 15>>
<op:deliver <desc:answer 3> ['make-car] 4 <desc:import-object 16>>
<op:deliver <desc:answer 4> ['drive] 5 <desc:import-object 17>>
```

In this way, it is not necessary to wait to dispatch messages until the promise
has been resolved. Messages can just be sent in advance to a promise of the
eventual object as they normally would to its eventual resolution. This also
improves efficiency by reducing the number of round trips needed to perform the
same task. Take the above example of a car factory which produces a car, the car
then can be driven which will produce a noise. Without promise pipelining this
would look something like this:

1.  Send message to create car factory
2.  Get back a reference to the car factory once it is made
3.  Send message to car factory to make a car
4.  Get back a reference to the car
5.  Send message to car to drive
6.  Get back the driving noise.

This is compared to when you use promise pipelining:

1.  Send message to create car factory
2.  Send message to car factory promise to make a car
3.  Send message to car promise to drive
4.  Get back driving noise

The other CapTP session, which is making the car factory, car, and finally car
noise, is able deliver those messages immediately to the local objects on their
side as they become fulfilled and send the car noise back at the end.


# [Cryptography](#cryptography)

Each party within a CapTP session has their own per session key pair which is
used for signing certain structures for example in the [third party handoffs
section](#third-party-handoffs). These key pair values are generated EdDSA with
a SHA512 hash.

**NOTE:** These representations are considered temporary and we are anticipating
replacing them, probably with record-based representations.

## [Public Key](#public-key)

Public keys are formatted based on gcrypt's s-expression format, using EdDSA
public keys and the SHA512 hash algorithm. The EdDSA public keys are based on
the Ed25519 elliptic curve. The public key is formatted as follows:

```text
['public-key ['ecc ['curve 'Ed25519] ['flags 'eddsa] ['q q_value]]]
```

In the above format, the `q_value` is a [ByteArray][Model-ByteArray] value of 32 bytes,
representing the public key.

## [Public ID](#public-id)

The Public ID for a peer is a [ByteArray][Model-ByteArray] of length 32.

1. Serialize the per session public key [as described here](#public-key).
2. SHA256 hash of the result produced in step 1.
3. SHA256 hash of the result produced in step 2.

## [Session ID](#session-id)

The Session ID for a session is a [ByteArray][Model-ByteArray] of length 32.

1. Calculate the Public ID of each side using [the process described here](#public-id).
2. Sort both IDs based on the resulting octets.
3. Concatinate the Public IDs in the order determined in step 2.
4. Prepend the string "prot0" to the beginning.
5. SHA256 hash the result from step 4.
6. SHA256 hash the result from step 5.

## [Signature](#signature)

Signatures are formatted using gcrypt's s-expression format and the EdDSA
signature scheme. The formatted signature s-expression follows this structure:

```text
['sig-val ['eddsa ['r r_value] ['s s_value]]]
```

In the above format, the `r_value` and `s_value` are [ByteArray][Model-ByteArray] values each of 32 bytes,
representing the signature parameters.

# [Third Party Handoffs](#third-party-handoffs)

Third party handoffs are used when a message that is sent within a CapTP session
contains a reference to an object that has been imported from a different CapTP
session. This ability to include remote references to objects is a crucial part
of CapTP as it enables objects to use any references they hold in any context.

The third party handoffs specified here ensure this can be done in a secure
fashion, even if the messages are viewed by a malicious actor.

Third party handoffs define three roles:

- **Gifter**: The peer sharing their [Reference][Model-Reference].
- **Receiver**: The peer the [Reference][Model-Reference] is being shared with.
- **Exporter**: The peer exporting the [Reference][Model-Reference].

These three peers imply three sessions connecting them:

- **Gifter-Exporter**
- **Gifter-Receiver**
- **Exporter-Receiver**

## Handoffs from the Gifter's perspective

When a message is sent over a CapTP boundary that includes a [Reference][Model-Reference]
imported from a different session, a handoff MUST occur. The handoff is
initated by the Gifter doing two things:

- Depositing a "gift" to the exporter's bootstrap object.
- Creating and sending a signed `desc:handoff-give` to the Receiver in place of the [Reference][Model-Reference].

### [Depositing the gift](#depositing-the-gift)

The gift is simply the imported [Reference][Model-Reference] that the Gifter holds. This is
deposited by sending a [`op:deliver-only`](#opdeliver-only) message to the
exporter's bootstrap object with three `args`, which are:

1.  A symbol that is the value `deposit-gift`
2.  A non-negative integer that is the ID of the gift, this MUST not have been used
    before in the **Gifter-Exporter** session (the `gift-id`)
3.  The [Reference][Model-Reference] being exported to the Receiver.

This is an example of how the message would look like:

```text
<op:deliver-only <desc:export 0>               ; Remote bootstrap object
                 ['deposit-gift                ; Symbol "deposit-gift"
                  42                           ; gift-id, a non-negative integer (>=0)
                  <desc:import-object ...>]>   ; remote object being shared
```

### Creating the `desc:handoff-give`

This certificate is provided by the Gifter to the Receiver, the Receiver then
creates a `desc:handoff-receive` which includes this signed [`desc:handoff-give`](#desc-handoff-give)
certificate and passes it to the Exporter to redeem the gift.

The specifics of creating a `desc:handoff-give` is described in the
[`desc:handoff-give` section](#desc-handoff-give).

How to check the validity of this certificate as the Exporter is covered in the
[`desc:handoff-receive`](#desc-handoff-receive).

### Sending the `desc:handoff-give`

The signed [`desc:handoff-give`](#desc-handoff-give) is used in any place that takes a [Passable value][Model-Passable] (such as `op:deliver` args) to represent
the third-party [Reference][Model-Reference] in the message.

## Handoffs from the Receiver's perspective

When a [`desc:handoff-give`](#desc-handoff-give) is received, several actions
should be taken:

-   Validate the `desc:handoff-give`.
-   Construct a local promise in order to deliver the message to the intended
    object. The promise should eventually resolve to the remote reference.
-   Establish a connection to the Exporter if one does not exist.
-   Construct a [`desc:handoff-receive`](#desc-handoff-receive) and send it to
    the Exporter's Bootstrap object via the [`withdraw-gift` method](#withdraw-gift-method).

The specifics of constructing the `desc:handoff-receive` message are specified
in the [desc:handoff-receive](#desc-handoff-receive) section. Once constructed,
you MUST send the `desc:handoff-receive` to the Exporter's [`withdraw-gift` method](#withdraw-gift-method). The
promise created by sending the message SHOULD resolve to the deposited gift,
provided no error has occured during the handoff process.

## Handoffs from the Exporter's perspective

There are two events which will happen for the Exporter, these can happen *in any
order*:

-   The Gifter deposits a gift.
-   The Receiver sends a [`desc:handoff-receive`](#desc-handoff-receive) via the [`withdraw-gift` method](#withdraw-gift-method).

The Exporter performs the following:

1.  MUST verify the `desc:handoff-receive` and the `desc:handoff-give` it contains (see `desc:handoff-receive` section).
    If it is incorrect, abort the handoff; otherwise, continue.
2.  If the gift has already been deposited return the gift; otherwise return the
    gift when it is received.

Note: Gifts are specified by the Gifter to a single Receiver via the Receiver's Public Key from
the **Gifter-Receiver** session. The Exporter will likely not have seen this Public Key before.
The Receiver should be the only party able to withdraw the gift left by the Gifter.
Implementers MUST ensure that the management of gifts adheres to this requirement,
preventing unauthorized access to gifts.

# [The bootstrap Object](#bootstrap-object)

The bootstrap object is responsible for providing access to local objects on the
session. It has three different behaviors, selected using the conventional CapTP
method mechanism of sending a symbol as the first argument. The following
methods are available:

-   `fetch`
-   `deposit-gift`
-   `withdraw-gift`

The bootstrap object MUST be exported on each newly initialized CapTP session at
export position `0`. A session is considered initialized if both sides send and
receive both [`op:start-session`](#opstart-session) messages.

## `fetch` Method

This method is used to fetch an object from the bootstrap object. To use it you
need a `swiss-number` which is a Binary Data type. This swiss number should
correspond an object which exists in this session. The result will be the object
which corresponds to this `swiss-number` or an error if the object does not
exist or a swiss number was not provided.

An example of how to use this method is:

```text
<op:deliver <desc:export 0>          ; Remote bootstrap object
            ['fetch                  ; Argument 1: Symbol "fetch"
             swiss-number]           ; Argument 2: Binary Data
            3                        ; Answer position: positive integer
            <desc:import-object 5>>  ; object exported by us at position 5 should provide the answer
```

## `deposit-gift` Method

The deposit gift method is used in conjunction with sending a [Third Party Handoff](#third-party-handoffs).
This method is used to deposit a gift which has been sent to the bootstrap object. It has two arguments:

1.  A gift ID that is non-negative integer.
2.  A [Reference][Model-Reference] which has been exported
    within the given CapTP session.

This should have been sent with the [`op:deliver-only`](#op-deliver-only) operation.

Here is an example of how to use this method:

```text
<op:deliver-only <desc:export 0>            ; Remote bootstrap object
                 ['deposit-gift             ; Argument 1: Symbol "deposit-gift"
                  gift-id                   ; Argument 2: Non-negative integer (>=0)
                  <desc:import-object 5>]>  ; Argument 3: object being shared via handoff
```

## `withdraw-gift` Method

This method is used to send the [`desc:handoff-receive`](#desc-handoff-receive)
in order to receive a gift. It has one argument:

- The `desc:handoff-receive`

This should have been sent with the [`op:deliver`](#op-deliver) operation, the response the
bootstrap object should give is the gift which was (or will be) deposited.

Here is an example of how to use this method:

```text
<op:deliver <desc:export 0>           ; Remote bootstrap object
            [withdraw-gift            ; Argument 1: Symbol "withdraw-gift"
             <desc:handoff-receive>]  ; Argument 2: sig:envelope containing desc:handoff-receive
            1                         ; Answer position: Non-negative integer (>=0)
            <desc:import-object 3>>   ; The object exported (by us) at position 3, should receive the gift.
```

# Operations

## [`op:start-session`](#opstart-session)

On a new connection, a key pair for this session should be generated. This
key pair should be an EdDSA key pair with a SHA512 hash.

This operation is used when a new connection is initiated over CapTP. Both
parties MUST send upon a new connection. The operation looks like this:

```text
<op:start-session captp-version             ; String value
                  session-pubkey            ; CapTP public key value
                  acceptable-location       ; OCapN Reference type
                  acceptable-location-sig>  ; CapTP signature
```

It's important that we only have one bidirectional connection between a CapTP
session. Before trying to connect to a peer, it's important to check that a
connection is not already open before proceeding. There is a race condition
called the "crossed hellos" problem whereby each side tries to open a new
connection at the same time and only one of these connection attempts must
succeed. The way to check which attempt should succeed is to sort the serialized
`session-pubkey`, the highest of the two wins.

### Constructing and sending

The `captp-version` MUST be `1.0`.

The `session-pubkey` is the public key part of the per-session key pair
generated for this connection. This is serialized in accordance with
[Cryptography](#cryptography)

The `acceptable-location` is a OCapN Locator which represents the location where
the session is accessable.

The `acceptable-location-sig` is the signature of the serialized
`acceptable-location`. The signature is created using the private key from the
per-session key pair. This is serialized in accordance with
[Cryptography](#cryptography)

### Receiving

The `captp-version` MUST be equal to `1.0`. If the version does not match, the
connection MUST be aborted.

The `acceptable-location-sig` MUST be valid that the `session-pubkey` provided a
valid signature of `acceptable-location`.

## [`op:deliver-only`](#opdeliver-only)

This operation delivers a message to an object and does not expect any result
from the receiving object.

The `op:deliver-only` message is:

```text
<op:deliver-only to-desc  ; desc:export
                 args>    ; Sequence
```

`to-desc` is a `desc:export` descriptor which corresponds to the object the
message is being sent to.

`args` is a sequence which are the arguments to invoke the object with.

Since this message has no result, it should be delivered to the object but
nothing further is required.

## [`op:deliver`](#opdeliver)

This operation delivers a message to an object with the expectation of a return
value which should be installed at the location specified in `answer-pos`. The
`op:deliver` message is:

``` text
<op:deliver to-desc           ; desc:export
            args              ; sequence
            answer-pos        ; positive integer | false
            resolve-me-desc>  ; desc:import-object | desc:import-promise
```

The `resolve-me-desc` is a `desc:import-object` or `desc:import-promise` which
represents a reference to a local object which will be notified upon the
resolution of the promise.

### Sending

When sending a message which expects a result, a promise should be generated on
the side which is sending the `op:deliver`. This promise should be provided
to the object sending this message. See the [promises section](#promises) for
more information.

#### `to-desc`
This value corresponds to the object the message is being sent to. When promise
pipelining is being used, this MUST be a [`desc:answer`](#desc-answer)
representing the answer position. In other cases, this MUST be a
[`desc:export`](#desc-export) representing an object that has been exported by
the recipient in the CapTP session.

### `args`
`args` is a sequence of the arguments to invoke the object with.

### `answer-pos`
When [promise pipelining](#promise-pipelining) is being used, this value should
represent the location the promise should be created at. This location is
described as the "answer position", this is different form the regular exporting
position used when a session exports an object. This is because the position is
decided by the sender of the message, not the receiver. The answer position is a
positive integer, which must be unique within the CapTP session. This is usually
incremented as an incrementing integer, however provided the answer position is
not in use, it is a valid answer position.

This answer position is then referenced with a [`desc:answer`](#desc-answer)
descriptor. Note that when the answer position is no longer needed, it's
important to notify the other side with a [`op:gc-answer`](#opgc-answer)
message (see section for details).

If no promise pipelining is needed, this value should be false.

### `resolve-me-desc`
This is a `desc:import-object` or `desc:import-promise` which represents a
reference to a local object which will be notified upon the resolution of the
promise.

### Receiving
The message should be delivered to the object referenced by `to-desc` with the
arguments specified in `args`. As the message is an `op:deliver`, the sender is
expecting a result. This result should be delivered to the object specified by
`resolve-me-desc` when available.

If `answer-pos` is a positive integer, then promise pipeling is used. In this
case, a promise MUST be created and exported at the answer position specified by
`answer-pos`. This promise MUST resolve to the result the object returns.
Messages sent to this promise MUST be delivered to the object when the promise
resolves (unless the promise breaks). This promise should remain available until
the [`op:gc-answer`](#opgc-answer) message is received. If the `answer-pos` is
false, then promise pipelining is not used.

## [`op:abort`](#opabort)

This is used to abort a CapTP session, when this is sent the connection should
be severed and any per session information (e.g. session key pair, etc.) should
be removed.

The `op:abort` message is:

```text
<op:abort reason>  ; reason: String
```

## [`op:listen`](#oplisten)

This is used to listen to a promise. This is done in order to get notified when
the promise is fulfilled with a value or broken on an error. Please see the
[promises section](#promises) for more information on how promises work.

The `op:listen` message is:

```text
<op:listen to-desc           ; desc:export | desc:answer
           listen-desc       ; desc:import-object
           wants-partial?    ; boolean
```

The `wants-partial` flag indicates if a "partial" update should be provided as
the notification to `listen-desc` when the promise resolves to another promise.
If `wants-partial` is false, a notification is sent only when the promise
resolves to a non-promise value or breaks (i.e., not when it resolves to another
promise). If `wants-partial` is true, a notification is sent for any resolution,
including to another promise. Any notification is considered to conclude the
`op:listen` interaction, and if future notifications are desired (e.g., after a
partial notification) then further `op:listen` operations should be sent.

### Sending

`to-desc` MUST be a `desc:export` or `desc:export` which corresponds to a
promise on the remote side.

`listen-desc` MUST be a `desc:import` that is being imported. This will be
invoked when the promise comes to a resolution.

### Receiving

When receiving this message, providing `to-desc` matches a promise exported to
this session, a mechanism MUST be setup to fulfill or break the provided
resolver when a resolution is available to the `listen-desc` object. If a
resolution is already available, the resolver provided in `listen-desc` MUST be
fulfilled or broken.

## [`op:get`](#opget)

`op:get` requests the value for the named field of an eventually settled
[Struct](Model.md#struct).
The get operation follows promise resolutions, inheriting the rejection reason
of any intermediate rejected promise.
The operation rejects the answer if the ultimate fulfillment of the receiver
is not a Struct or if the named field is absent on the Struct.

The messages looks like:
```
<op:get receiver-desc       ; <desc:answer | desc:import-promise>
        field-name          ; String
        new-answer-pos>     ; Positive Integer
```

> The `op:get` operation allows a sender to pipeline messages to a
> [Target](Model.md#target) that is deeply embedded in one or more enveloping
> Structs, [Lists](Model.md#list), or [Tagged](Model.md#tagged) values.
> For cases where the receiver of a get operation is an answer slot with no
> listeners, sending `op:get` obviates the transmission of uninteresting fields
> of a potentially large Struct.

### Sending
#### `receiver-desc`
This must be the `desc:answer` or a `desc:import-promise` value which
eventually leads to the Struct you wish to get the value from.
#### `field-name`
This must be a [String](Model.md#string) designating a field of the Struct
you wish to get the value from.
#### `new-answer-pos`
This should be a new unique answer position that the selected value should be
exported at.

### Receiving
When receiving the `op:get` message, export a promise at the
answer position specified by `new-answer-pos`.
The promise should eventually resolve to the value at the field specified by
`field-name`, in fields of the `receiver-desc` Struct.
If the `receiver-desc` promise breaks, or the `field-name` is absent on the
eventual receiver, the promise breaks.

## [`op:index`](#opindex)

`op:index` requests the value at the given index of an eventually settled
[List](Model.md#list).
The index operation follows promise resolutions, inheriting the rejection
reason of any intermediate rejected promise.
The operation rejects the answer if the ultimate fulfillment of the receiver
is not a List.

The messages looks like:
```
<op:index receiver-desc       ; <desc:answer | desc:import-promise>
          index               ; Integer
          new-answer-pos>     ; Positive Integer
```

> The `op:index` operation allows a sender to pipeline messages to a
> [Target](Model.md#target) that is deeply embedded in one or more enveloping
> Lists, [Structs](Model.md#struct), or [Tagged](Model.md#tagged) values.
> For cases where the receiver of an index operation is an answer slot with no
> listeners, sending `op:index` obviates the transmission of uninteresting
> values of a potentially large List.

### Sending
#### `receiver-desc`
This must be the `desc:answer` or a`desc:import-promise` value which eventually
leads to the List you wish to get the value from.
#### `index`
This must be a zero-indexed integer which specifies which value should be
picked out of the List.
#### `new-answer-pos`
This must be a new unique answer position that the selected value should be
exported at.

### Receiving
When the `op:index` message is received, a promise should be exported at the
answer position specified by `new-answer-pos`.
The promise should eventually resolve to the value at the index specified by
`index`, in values provided in the List eventually fulfilled at
`receiver-desc`.
If the `receiver-desc` promise breaks, or the `index` is out of
the bounds of the receiver List, the promise should break.

## [`op:untag`](#opuntag)

`op:untag` requests the value for an eventually settled
[Tagged](Model.md#tagged) value.
The operation rejects the answer if the ultimate fulfillment of the receiver is
not a Tagged value.

The messages looks like:
```
<op:untag receiver-desc       ; <desc:answer | desc:import-promise>
          tag                 ; A String
          new-answer-pos>     ; Positive Integer
```

> The `op:untag` operation allows a sender to pipeline messages to a
> [Target](Model.md#target) that is deeply embedded in one or more enveloping
> tagged values and to assert the expected tag, possibly enveloped in further
> [Structs](Model.md#struct), [Lists](Model.md#list), or Tagged values.
> For cases where the receiver of an untag operation is an answer slot with no
> listeners, sending `op:untag` obviates the transmission of the uninteresting
> intermediate tag.

### Sending
#### `receiver-desc`
This must be the `desc:answer` or a`desc:import-promise` value which eventually
leads to the Tagged value.
#### `tag`
This must be a [String](Model.md#string) corresponding to the expected tag
string of the eventually settled receiver [Tagged](Model.md#tagged).
#### `new-answer-pos`
This must be a new unique answer position that the selected value should be
exported at.

### Receiving
When the `op:untag` message is received, a promise should be exported at the
answer position specified by `new-answer-pos`.
The promise should eventually resolve to the tagged value, provided in the
Tagged value eventually fulfilled at `receiver-desc` (the receiver), or rejected
if the received tag does not match the tag of the receiver.

## [`op:gc-export`](#opgc-export)

When a reference is given out over CapTP, the reference must be kept
valid until the other party within a session is done with it. This is
achieved by reference counting the object with respect to how many
times a reference has been sent. Each time a reference is sent, the
count MUST be incremented (the first time it is sent, the reference
count should be set to 1). When the reference count reaches 0, the
object can be garbage collected.

The reference count is decremented when the other side sends an `op:gc-export`
message. The `wire-delta` value should be subtracted from the reference count.
Each time the remote session no longer needs the reference, it should send an
`op:gc-export` message with a `wire-delta` that reflects the number of
references it has been given:

The message looks like:

```text
<op:gc-export export-pos   ; positive integer
              wire-delta>  ; positive integer
```

## [`op:gc-answer`](#opgc-answer)

When a [`op:deliver`](#opdeliver) is sent with an `answer-pos` for use with
promise pipelining. The receiver will create a promise at the answer position.
The receiver needs to know when it's able to garbage collect this promise. This
is done by sending an `op:gc-answer` message. The `answer-pos` in this message
MUST correspond to the `answer-pos` in the [`op:deliver`](#opdeliver) message,
that you are no longer interested in.

Once the `answer-pos` has been GC'd through sending the `op:gc-answer`
operation, the `answer-pos` can be re-used.

```text
<op:gc-answer answer-pos>  ; answer-pos: positive integer
```

# Descriptors

Several operations (e.g. `desc:import-object` and `desc:export`) are describing
importing and exporting objects. There had to be a choice if these actions
should be described from the sender's or receiver's side, in this case we
choose the receiver's side. This means if an object is exported from
Alice to Bob, Alice sends a `desc:import-object` as Alice is describing
it from Bob's perspective.

## [`desc:import-object`](#desc-import-object)

Any object which is exported over CapTP is described with a positive integer.
This positive integer MUST be unique to this CapTP session and refer to this
specific object.

```text
<desc:import-object position>  ; position: positive integer
```

Position `0` is reserved for the [bootstrap object](#bootstrap-object).

## [`desc:import-promise`](#desc-import-promise)

When a promise is exported over a CapTP boundary is it described with a
`desc:import-promise` message. This message contains a positive integer which is
unique to the exporting party within the CapTP session and refers to
this specific promise.

```text
<desc:import-promise position>  ; position: positive integer
```

## [`desc:export`](#desc-export)

When a message is sent across a CapTP boundary that refers to an imported object
within the session the message is being sent to (either a `desc:import-object`
or a `desc:import-promise`), then this should be referred to with a
`desc:export`. The position MUST be the positive integer provided in the import
descriptor.

If an object reference is being sent from a different session, see the [Third
Party Handoffs](#third-party-handoffs) section.

```text
<desc:export position>  ; position: positive integer
```

## [`desc:answer`](#desc-answer)

This is used to refer to a promise which is being pipelined. The position MUST
be the positive integer provided in the [`op:deliver`](#opdeliver) message.
This should not be referenced after the [`op:gc-answer`](#opgc-answer) message
has been sent for this position.

```text
<desc:answer answer-pos> ; position: positive integer
```

## [`desc:sig-envelope`](#desc-sig-envelope)

This encapsulates a CapTP object and provides a signature. The signature is
created on the binary data of the serialized CapTP object in the `signed` field.

The process of generating this is:

1.  Fully serialize to a CapTP object to Syrup octets.
2.  Sign the result of step 1 using the private key.
3.  Create a `desc:sig-envelope` with the (original, unserialized) CapTP object
    and signature.

```text
<desc:sig-envelope signed      ; captp-object
                   signature>  ; Signature (see cryptography section)
```

When this is received, the signature must be valid using the corresponding
public key. If the signature is not valid, the operation should be aborted.

NOTE: The value of `signed` should be the object itself (opposed to the binary
data produced via serialization in step 1).  Syrup itself provides
canonicalization, which allows for serialization to always produce the same
result.

## [`desc:handoff-give`](#desc-handoff-give)

In [Third Party Handoffs](#third-party-handoffs), the Gifter creates a `desc:handoff-give` and sends it to the Receiver.
The Receiver uses the `desc:handoff-give` to redeem the gift from the Exporter.
This record is a certificate created by the Gifter, sent to the Recevier,
and ultimately used by the Receiver to redeem the gift from the Exporter.

The Gifter prepares the record by,
1.  Creating a `desc:handoff-give`
2.  Signing the `desc:handoff-give` and wrapping it within a `desc:sig-envelope`
3.  Replace the [Reference][Model-Reference] to the remote object being gifted in the message with
    the signed record produced in step 2.

### The record

```text
<desc:handoff-give receiver-key       ; Public Key (see cryptography section)
                   exporter-location  ; OCapN Locator (see Locator document)
                   session            ; Session ID (ByteArray)
                   gifter-side        ; Public ID (ByteArray)
                   gift-id>           ; non-negative integer (>=0)
```

1.  `receiver-key` This is the Receiver's Public Key in the **Gifter-Receiver** session.
2.  `exporter-location` This is the [OCapN Locator][Locators] of the Exporter.
3.  `session` This is the [Session ID](#session-id) for the **Gifter-Exporter** session.
4.  `gifter-side` This is the [Public ID](#public-id) for the gifter in the **Gifter-Exporter** session.
5.  `gift-id` This is the gift ID that is generated by the Gifter that the
    gift will be deposited at. This `gift-id` MUST be unique for gifts
    deposited by the Gifter in the **Gifter-Exporter** session.

This message MUST always be encapsulated in a
[`desc:sig-envelope`](#desc-sig-envelope) with a valid signature.

The signature is made using the Gifter's key from the **Gifter-Exporter** session.

### Validating the record

The Receiver is the first to get the `desc:handoff-give`.
The only field that the Receiver can verify is the receiver-key, it should match
the Receiver's Public Key from the **Gifter-Receiver** session.

The Exporter later receives the `desc:handoff-give` inside of the `desc:handoff-receive`,
and the process for validating the `desc:handoff-give` is detailed in [`desc:handoff-receive`](#desc-handoff-receive).


## [`desc:handoff-receive`](#desc-handoff-receive)

This record is used in [Third Party Handoffs](#third-party-handoffs).

The `desc:handoff-receive` record is created by the Receiver and sent to the Exporter.
It includes the signed [`desc:handoff-give`](#desc-handoff-give) from the Gifter,
as well as some additional data provided by the Receiver.

The primary purpose of this certificate is to associate the Receiver's **Exporter-Receiver** session
identity with the Receiver's **Gifter-Receiver** session identity. The Gifter specifies the gift recipient
to the Exporter as the Receiver's **Gifter-Receiver** session identity.

### The record

```text
<desc:handoff-receive receiving-session  ; Session ID (ByteArray)
                      receiving-side     ; Public ID (ByteArray)
                      handoff-count      ; Non-negative integer (>=0)
                      signed-give>       ; desc:sig-envelope containing desc:handoff-give
```

1.  `receiving-session` This is the [Session ID](#session-id) in the **Exporter-Receiver** session.
2.  `receiving-side` This is the Receiver's [Public Key](#public-key) **Exporter-Receiver** session.
3.  `handoff-count` This is a non-negative integer which MUST not have been used in the **Exporter-Receiver** session.
4.  `signed-give` This is the [`desc:handoff-give`](#desc-handoff-give) that is encapsulated in the
    `desc:sig-envelope` from the Gifter.

This message MUST always be encapsulated in a
[`desc:sig-envelope`](#desc-sig-envelope) with a valid signature.

The signature is made using the Receiver's key from the **Gifter-Receiver** session (**NOT** the **Exporter-Receiver** session).

### Checking the validity of the `desc:handoff-receive`

There are a number of steps which must be followed to verify the
`desc:handoff-receive`, these rely on information that is specific to the two
sessions.

#### Identifying the Gifter session & Receiver session

The two sessions are:
-  **Gifter-Exporter**: The session where the Gifter designates the gift.
-  **Exporter-Receiver**: The session where the Receiver is redeeming the gift.

The **Gifter-Exporter** session can be found via the `session` field in the [`desc:handoff-give`](#desc-handoff-give)
which specifies a [Session ID](#session-id). The **Exporter-Receiver** session can be found via
the `receiving-session` field which specifies a [Session ID](#session-id) on the [`desc:handoff-receive`].

#### Checking the signature on the [`desc:handoff-give`](#desc-handoff-give)

The [`desc:handoff-give`](#desc-handoff-give) must have been wrapped in a `desc:sig-envelope`. This
envelope carries with it a signature made using the Gifter's key from the **Gifter-Exporter**
session.

The signature MUST be verified as correct.

Once this has been verified the information in the [`desc:handoff-give`](#desc-handoff-give) is known
to have been created by the Gifter.

#### Checking the signature on the `desc:handoff-receive`

The information provided to the Exporter must be verified to have come from the
receiver that the Gifter has designated. This can be done as the Gifter has
provided the Receiver's Public Key in the **Gifter-Receiver** session and the
`desc:handoff-receive` has been signed by the Receiver using their private key
for that same **Gifter-Receiver** session.

To verify, take the Receiver's public key for the **Gifter-Receiver** session
from the `receiver-key` field in the `handoff-give` and use it to check the
signature in the `desc:sig-envelope` encapsulating the `desc:handoff-receive`.

If the signature is invalid, the handoff procedure MUST be aborted. Otherwise if
it is valid, the information is now known to have been created by the receiver
that the Gifter has designated.

#### Checking the `handoff-count`

The `handoff-count` in the `desc:handoff-receive` MUST be a non-negative integer
that has NOT been used before in the **Exporter-Receiver** session.
If the `handoff-count` has been used before in this session, the handoff should
be aborted. This protects against replay attacks.

### Receiving a `desc:handoff-receive`

When the Bootstrap's [`withdraw-gift` method](#withdraw-gift-method) is invoked, the following must happen:

1.  A local promise is created and exported.
2.  The `desc:handoff-receive` is verified, if invalid the promise MUST be
    broken and the handoff aborted.
3.  If the handoff-receive is valid:
  -   If the gift has already been deposited, fulfill the promise with the gift
  -   If the promise has not yet been deposited, wait until it has and then
      fulfill the promise with the gift if/when it is deposited.

# History of OCapN

## Actor Model

The actor model which is foundational in CapTP and underpins the design of
OCapN. The actor model was proposed by Carl Hewitt, Henry Baker, Henry
Lieberman, Will Clinger, Gul Agha, and others at MIT.

## Joule programming language

The Joule programming language is a capability secure programming language,
designed for building distributed applications. It was developed by Dean
Tribble, Mark Miller, Norm Hardy and others while at Agorics. Joule was
primarily true to being a distributed object capability style language with an
emphasis on actor model type purely asynchronous interactions. The designs of
promises and promise pipelining are derived from those of Joule, and have been
influential on the appearance of promises in languages such as Javascript.

## E programming language

The E programming language is continuing the ideas of Joule, and is a capability
secure programming language, designed for building distributed applications. It
was developed by Mark Miller, Dan Bornstein, Douglas Crockford, Chip
Morningstar, Randy Farmer, Bill Frantz, Jamie Fenton, and others while at
Electric Communities.

E developed the vat model of computation (distributed objects within
communicating event loops, the conceptual model behind most distributed OCapN
systems today) and the distributed networking protocol abstractions at the core
of CapTP and VatTP (called "netlayers" in OCapN).

## Cap'N Proto

Cap'N Proto implemented a unique variant of CapTP which was based on statically
typed interface structures shared between multiple communicating
implementations. Because of this, Cap'N Proto managed to bring many of the
powerful ideas of CapTP to many new audiences while also providing a
high-performance API. While the statically typed interface description layer
approach of Cap'N Proto is not the same as the more dynamic approach taken by
OCapN's CapTP, the excellent documentation of Cap'N Proto's descriptions of its
implementation of CapTP's ideas were key to the development of OCapN.

## Agoric and Endo

Agoric carried forward the designs of E into the land of Javascript, including
bringing forward CapTP and promise pipelining. Agoric did much of the research
and development of what later became Endo, a secure JavaScript platform for
secure communication. An analysis of Agoric/Endo's implementation of
[CapTP](https://github.com/endojs/endo/tree/master/packages/captp) was
instrumental to the design of the version of CapTP seen in OCapN.

While at Agoric, Mark S. Miller also provided the re-conceptualization of
promise pipelining in CapTP as using "handoff tables", which later formed the
conceptual basis of the "gifting" mechanism implemented in OCapN's CapTP.

## Spritely

The Spritely Project and Spritely Networked Communities Institute developed
Spritely Goblins, in many ways a combination of the ideas of E and Scheme.
Goblins implemented the particular flavor of CapTP which from which much of
OCapN's CapTP was derived, including the certificate-based third party handoffs.
Spritely Goblins' CapTP was implemented by Christine Lemmer-Webber and Jessica
Tallon. Goblins also introduced the abstractions for OCapN's "netlayers"
interface (an analogue to E's "VatTP").

# Funding

This document has been written with funding through the [NGI Assure Fund](https://nlnet.nl/assure), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more on the [NLnet project page]( https://nlnet.nl/project/SpritelyOCCapN#ack).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGIAssure_tag.svg" alt="NGI Assure Logo" width="20%" />](https://nlnet.nl/assure)

[Model-ByteArray]: ./Model.md#bytearray
[Model-Reference]: ./Model.md#reference-capability
[Model-Passable]: ./Model.md#value
[Locators]: ./Locators.md
