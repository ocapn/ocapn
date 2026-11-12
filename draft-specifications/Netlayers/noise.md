# Warning: This is a draft specification likely to undergo significant change

These documents are draft specifications which will likely undergo significant
change as the group converges on the design of OCapN. If you're interested in
being part of that work, please join!

Authors: Jessica Tallon & The OCapN Pre-standardization Group.

# Additional Documents

- [OCapN CapTP](../CapTP%20Specification.md): Secure messaging protocol for
  object communication.
- [OCapN Locators](../Locators.md): Representation of object references for both
  in-band and out-of-band usage.
- [Noise Protocol](https://noiseprotocol.org/noise.html): The Noise Protocol
  Framework specification.

# Introduction

This netlayer provides strong encryption of the messages sent with it, and
provides peer authentication. The netlayer, unlike many others, is what is known
as a meta-netlayer. Meta-netlayers don't specify a specific transport mechanism
but use other OCapN netlayers as a transport layer, this is done by layering
OCapN on top of OCapN. The result of composing this netlayer with another
netlayer is the other netlayer doesn't need to provide encryption or
bidirectional peer authentication.

## Topology

The Noise netlayer requires two layers of CapTP, one of which relies on the
encryption and security properties of the transport netlayer, the other of which
is the end-to-end encrypted CapTP.

The topology is:
```
Noise CapTP (e2ee)
   |  ^
   v  |
Noise Netlayer
   |  ^
   v  |
Transport CapTP
   |  ^
   v  |
Transport Netlayer
```

The transport CapTP provides us a netlayer agnostic mechanism of communicating
to another peer. Since the netlayer works by delivering end-to-end encrypted
messages to another peer, the netlayer mainly uses the notion of an
[outbox object](#outbox). These objects are exported by the Transport CapTP and
messaged over the Transport CapTP with the e2ee messages.

All messages from the Noise CapTP are encrypted by the Noise Netlayer, then
sent as `op:deliver` messages to the remote peer's outbox object. Similarly,
incoming messages are delivered to the Noise Netlayer's outbox object and
decrypted and then sent to the Noise CapTP.

# Noise

This netlayer uses [Noise Protocol](https://noiseprotocol.org/noise.html)
framework with the XK handshake pattern. Noise allows for different key
generation, cipher suite and hashing algorithms. The Noise Netlayer uses
[x25519](https://noiseprotocol.org/noise.html#the-25519-dh-functions) key
generation,
[AES-GCM](https://noiseprotocol.org/noise.html#the-aesgcm-cipher-functions)
cipher functions, and
[SHA-256](https://noiseprotocol.org/noise.html#the-sha256-hash-function) hash
function. These have been selected for their wide availability. This means the
Noise Netlayer always uses `Noise_XK_25519_AESGCM_SHA256` as the protocol name.

The implementation of Noise is out-of-scope for this document. Implementers are
referred to the Noise Protocol specification.

Noise imposes limits to both the maximum message length and the number of
messages that can be encrypted by a
[CipherState object](https://noiseprotocol.org/noise.html#the-cipherstate-object).

All Noise messages must be less than or equal to 65535 bytes in length, however
OCapN messages can be much larger. The netlayer supports message chunking to
allow for sending messages larger than 65535 bytes. See the
[message chunking](#message-chunking) section for more details.

Noise also limits the number of messages that can be encrypted with a given
CipherState object to 2^64-1 messages. OCapN sessions are expected to be
relatively short lived so it's unlikely for any session to reach this limit.
Each peer within a Noise session MUST ensure they do not exceed this message
limit. An implementation MUST abort the OCapN session and, if necessary,
reconnect to prevent exceeding the message limit.

Each Noise Netlayer is expected to generate a static key pair to be used with
Noise for all sessions. The public part of this static key forms the peer's
identity as described in [Noise Locator](#noise-locator) section.

# Objects

Since the netlayer is built on top of OCapN, several objects are defined by this
specification to ensure delivery of messages. This specification does not
require any specific design of the object framework, but instead describes these
objects in terms of the behavior upon messages sent to these objects. The
messaging between these objects is specified within the CapTP specification.

## [Noise Connector](#noise-connector)

The Noise connector object is how remote peers initiate new connections. A new
incoming connection occurs by messaging the Noise connector with a reference to
a new [outbox](#outbox) object.

The Noise connector then needs to create its own [outbox](#outbox) object which
is used by the sender to deliver messages. This outbox is provided in response
to the message. See the [establishing a connection](#establishing-connection)
section for more details.

## [Outbox](#outbox)

This object accepts new messages which are delivered to the peer which spawned
the outbox object. The object takes a single argument which is a Noise encrypted
CapTP message (with [byte-aligned prefix](#byte-aligned)), or a chunk of an
CapTP message.

Noise has a maximum plaintext message size of 65519 bytes. Since OCapN messages
can be larger than this, the netlayer supports [chunking](#chunking) messages
which are larger than this. Implementations MUST not send a chunk exceeding the
maximum Noise size. If a CapTP message with the total-length prefix cannot fit
within a Noise message, it MUST be chunked into smaller messages.

Messages to the outbox have no return value, so implementations should send
messages to the object using `op:deliver-only`.

### [Byte-aligned Prefix](#byte-aligned)

The prefix is using a byte-aligned varint encoding. This is an encoding which
supports large numbers, while being efficient to represent smaller numbers.

For values which can be represented in 7 bits, the prefix is one byte. The most
significant bit is `0` followed by the value in the remaining 7 bits.

For larger numbers, the leading byte is used to communicate the number of bytes
used for the prefix. This leading byte is set to `0x80` bitwise OR'd with the
number of bytes used to represent the number (excluding the leading byte). This
allows for representing values as large as 2^(127 × 8)-1.

The value is represented in little endian and is after the leading byte. An
example of three numbers encoded in the byte-aligned prefix:

```
;; The number 100
01100100

;; The number 200
10000001 11001000

;; The number 100,000
10000011 10100000 10000110 00000001
```

### [Chunking](#chunking)

OCapN allows messages much larger than the maximum size of Noise messages. All
CapTP messages are prefixed with a [byte-aligned](#byte-aligned) number
of bytes of the plaintext CapTP message.

When a CapTP message won't fit into the remaining bytes allowed by Noise,
implementations should use chunking. Chunking involves splitting the larger
bytearray into smaller bytearray which are short enough to be encrypted in
Noise. After the first chunk (with the prefix), subsequent chunks are encrypted
and sent without any prefix to the [outbox](#outbox) object. These chunks must
be sent in order and when concatenated total the length given in the first
chunk.

# [Noise Locator](#noise-locator)

The OCapN locator specifies the following:

- **Designator**: This is the Noise public key data encoded as base32 (without
  padding).
- **Transport**: Reserves the symbol "noise", however this can be used with
other netlayers to produce a composite netlayer. In those modes a different
transport may be selected.
- **Hints**: A hashmap with a single entry. The entry has the key set to
"connector", the value is the string representation of a sturdy reference to the
[Noise connector](#noise-connector) object for the peer.

# [Establishing a new connection](#establishing-connection)

When CapTP asks the Noise Netlayer to establish a new Noise connection given a
specific [OCapN Peer Locator](#noise-locator), the netlayer should extract the
Noise static key from the designator and the Noise connector from the hints.

The peer should then create a new
[HandshakeState Object](https://noiseprotocol.org/noise.html#the-handshakestate-object)
with:

1. `handshake_pattern` set to the appropriate value for the `XK` pattern
2. `initiator` flag set to true
3. `prologue` a zero-length bytearray.
4. `s` set to peer's own static key pair
5. `rs` set to the decoded public key from the OCapN Peer Locator

The peer should then spawn a new [Outbox object](#outbox) and then arrange with
the CapTP connection it's using to retrieve a live reference from the Noise
connector sturdy reference from the OCapN Locator.

Once the peer has retrived a live reference to the Noise connector, it should
send that object a message with a reference to its outbox actor. The message
should be sent with a `op:deliver`, as the return value will be the outbox for
it to use.

e.g.
```
;; Imagine the Noise connector is exported at position 1 and it's exporting its
;; own outbox object at position 50
<op:deliver <desc:export 1>
            [<desc:import-object 50>]
            3
            listen-mode
            resolver>
```

Each peer MUST then go through the Noise handshake as specified in the Noise
Protocol specification. Noise permits a payload to be sent alongside the
handshake message, but since this payload has weaker security properties than
after the handshake, it MUST not be used. The handshake payloads should
therefore be set to a zero-length bytearray.

Noise handshakes work on a turn-based approach where one peer writes a message
and the other peer then reads it. The peers then switch roles after each turn.
For the first turn, the initiator writes a handshake message and then the
responder reads the message. Please refer to the Noise protocol specification
for more details.

If any errors occur during the Noise handshake, the peer MUST terminate the
connection. If the handshake completes without errors, CapTP messages can then
be exchanged. Each sent message MUST be encrypted in order and delivered to the
[outbox object](#outbox) provided by the other peer. Messages should be read and
decrypted in order from the [outbox object](#outbox) created by them. These
messages should then be provided to CapTP.

# [Incoming connection](#incoming-connection)

As described in the [establishing a new connection](#establishing-connection)
section, a new incoming connection will be initiated by the peer sending a
message to the [Noise connector object](#noise-connector). The peer receving the
message is known as the responding peer. The responding peer should begin by
setting up their own
[HandshakeState Object](https://noiseprotocol.org/noise.html#the-handshakestate-object)
with:

1. `handshake_pattern` set to the appropriate value for the `XK` pattern
2. `initiator` flag set to false
3. `prologue` a zero-length bytearray.
4. `s` set to peer's own static key pair

They do not need to set up any remote key as that is communicated to the peer in
the handshake messages.

The peer should create its own [outbox object](#outbox) which MUST be returned
from the call to the message to the connector object. This outbox object is used
by the initiating peer to deliver both Noise handshake messages and CapTP
messages (after a successful Noise handshake).

The handshake and exchange of messages should occur in the same way for both
initiating peers and responding peers as outlined in
[establishing a new connection](#establishing-connection).

# Funding

This project was funded through the
[NGI0 Commons Fund](https://nlnet.nl/commonsfund), a fund established by
[NLnet](https://nlnet.nl/) with financial support from the European Commission's
[Next Generation Internet](https://ngi.eu/) programme. Learn more on the
[NLnet project page](https://nlnet.nl/project/OCapN-federatedrelays/).

[<img src="https://nlnet.nl/logo/banner.svg" alt="Logo NLnet: abstract logo of four people seen from above" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGI0CommonsFund_tag.svg" alt="Logo NGI Zero Commons Fund: letterlogo shaped like a tag" width="20%" />](https://nlnet.nl/commonsfund)
