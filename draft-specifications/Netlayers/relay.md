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
- [Noise Netlayer](noise.md): Noise netlayer used to provide end-to-end
  encryption and peer authentication.

# Introduction

The relay netlayer is a secure, end-to-end encrypted netlayer which is very
useful in environments where direct peer-to-peer connections are difficult or
impossible to establish. The relay is designed to be federated, so peers need
not share the same relay to connect with one another. The relay is what's known
as a "meta-netlayer", which means it doesn't specify an individual transport
layer. The meta-netlayer instead uses OCapN to transport the messages. The relay
netlayer uses three OCapN netlayers:

- **Transport layer**: OCapN configured with a concrete transport layer (e.g.
onion, websocket, etc.)
- **Underlay**: Specified within this document, it provides the relay behavior.
- **Noise**: Provides end-to-end encryption for the two relay clients.

The transport netlayer is any other netlayer used to communicate between relay
client and server. Layering the netlayers in this way allows each netlayer to
take advantage of CapTP and the object messaging platform as well as leverage
OCapN's transport agnostic design allowing for many different transport
netlayers to be used.

The relay is composed of two parts, the first is the relay client. The relay
client is specified in [underlay](#underlay-netlayer). There is also the relay
server which is a seperate more-accessible peer.

## Topology

As described above, the relay composes many different netlayers and CapTP
layers to provide the end-to-end encrypted functionality. These netlayers are
configured like the following:

```
Noise CapTP (e2ee)
   |  ^
   v  |
Noise Netlayer
   |  ^
   v  |
Underlay (relay) CapTP
   |  ^
   v  |
Underlay (relay) Netlayer
   |  ^
   v  |
Transport CapTP
   |  ^
   v  |
Transport Netlayer
```

The Noise CapTP at the top is what end users of the netlayer use, this provides
the secure end-to-end encrypted relay behaviour. The CapTP and netlayers below
are used internally to provide the function. The Noise netlayer is
specified in the [Noise specification](./noise.md), the
[underlay](#underlay-netlayer) is specified below and the transport is any
other netlayer.

Messages sent by the end user will be encrypted by the Noise netlayer which are
then handed to the relay client (underlay netlayer). The relay client uses the
transport CapTP to communicate with objects on the relay server. Since all the
relay's own internal messages are only as secure as the transport layer in use,
it's recommended to use a transport layer with strong encryption too.

# [Underlay Netlayer](#underlay-netlayer)

The underlay is the part of the netlayer which specifies the actual relay
behavior. While it is a netlayer in its own right, The underlay does not
provide any means of protecting the users of the relay from malicious relay
servers. Therefore it should not be provided to end users, or used directly.

Since this netlayer utilizes a transport netlayer to actually send and receive
messages, the specification needs to refer to this netlayer. The term "transport
netlayer" is used to refer to whatever netlayer is used.

The underlay netlayer is unusual in that it has two parts. It has a netlayer
part which is used on the "client" of the relay, and a "relay" server. OCapN is
used as the communication protocol between the netlayer and the relay server,
and between relay servers for federation.

## OCapN Locator

This OCapN locator is unusual in that within it encodes an
[OCapN sturdyref](../Locators.md#sturdyref-locator). This sturdyref is a locator
to the relay server's [endpoint](#endpoint) object. The netlayer chosen does not
need to be one the client speaks since connections are made between relays and
relayed back to the client netlayers.

- **Designator**: A syrup encoded list of three elements (base32 encoded):
  1. `designator`: The designator from the relay-to-relay peer locator.
  2. `transport`: The transport from the relay-to-relay peer locator.
  3. `swiss-num`: The swiss-num for the [endpoint](#endpoint) object on the
      relay server.
- **Transport**: The symbol `underlay`.
- **Hints**: The hints copied verbatim from the relay-to-relay peer locator.

The designator is encoded with Syrup and then base32 encoded with no padding.

## Objects

### [Session deliver](#session-deliver)

This object represents an outbox where messages can be deposited. It uses the
symbol method convention from CapTP and has two methods:

- `deliver`: takes an Syrup-encoded CapTP message (bytearray) and delivers it in
   order to the peer within a given session.
- `abort`: takes no arguments and aborts the session.

### [Session Listener](#session-listener)

This object exists on the client and is the entry point for new incoming
sessions. The object is spawned by the relay client (underlay netlayer) and
provided to the [controller](#controller) on the relay server via the
[`set-session-listener`](#set-session-listener-method) method.

The object has one method:

- `incoming-session`: This takes a single argument which is the
[session deliver](#session-deliver) object for sending messages to the
initiating peer.

The relay client should create and return a [session deliver](#session-deliver)
object for the new session. CapTP messages can then be exchanged using these two
objects.

### [Endpoint](#endpoint)

This object exists on the relay server and allows remote peers to form new
connections to a peer. The relay takes one argument which is a reference to a
newly created [session deliver](#session-deliver) object for the session. The
provided session deliver object should be used by the peer to deliver new
messages to the initiating peer.

The endpoint object should then create its own
[session deliver](#session-deliver) object which when provided with messages to
its `deliver` method should deliver them to the client. This session deliver
object should be returned to the initiator.

The endpoint should be registered on the transport's CapTP with a static
swiss-num.

### [Controller](#controller)

This object exists on the relay server and allows a peer to control the relay.
The controller uses the same method convention as CapTP, and has the following
methods:

- `connect`: takes two arguments:
  1. A underlay [OCapN Locator Peer](../Locators.md#ocapn-peer) to the peer for
     the relay server to connect to.
  2. A [Session deliver](#session-deliver) object used to deliver in-bound
     messages for this connection.
- `set-session-listener`: Takes a reference to a
[session listener](#session-listener) object. This listener will be informed of
all new incoming sessions send to the [endpoint](#endpoint).

#### `connect` method

This method is used by the netlayer client to make a new outbound connection to
a relay peer. The method takes two arguments:

1. A underlay [OCapN Locator Peer](../Locators.md#ocapn-peer) to the peer for
    the relay server to connect to.
2. A [session deliver](#session-deliver) an object to deliver inbound messages
   for this connection.

The relay server's controller object should decode a sturdyref using the encoded
`designator` from the Locator peer and the hints. The server will either find
the relevant endpoint if the same relay server is shared or make an OCapN
connection where both peers use different relay servers.

The controller then needs to create its own object which passes all messages to
it to the provided [session deliver](#session-deliver) object. Proxies are
typically unnecessary since CapTP supports
[third party handoffs](../CapTP%20Specification.md#third-party-handoffs).
However since the relay client and endpoint likely cannot speak directly the
relay must act as a proxy by creating its own object to relay those messages.

The controller will provide a [session deliver](#session-deliver) object in
response to the `connect` message. This is used by the underlay to send messages
to the remote peer. If the relay server fails to make a connection, or any other
error arises from handling the connection, this promise is broken.

#### [`set-session-listener` method](#set-session-listener-method)

This method is used to set the current [session listener](#session-listener)
object. It takes one argument, the new session listener reference. The relay
server will inform the session listener for each new incoming session until the
client disconnects, or a new call to the `set-session-listener` is made. Only
the most recent session listener will be notified of new sessions.

When no `set-session-listener` is set, the relay server may reject new incoming
connections, or it may hold them and deliver them to a session listener when
one is set.

## Netlayer

The underlay netlayer, sometimes referred to as the relay client, communicates
to the relay server over OCapN using a transport netlayer. The netlayer should
be provided access to OCapN references to the endpoint and controller, as well
as a sturdyref to the endpoint object on the relay server.

When created, it should spawn its own [session listener](#session-listener)
object. The netlayer should then send a message to the [controller](#controller)
using the `set-session-listener` method.

When CapTP asks the netlayer to make a new outbound connection to another peer
at a specific location, the netlayer should do the following:

1. Setup its own [session deliver](#session-deliver) object for new messages to
be sent.
2. Provide both the location and the session deliver to the
[controller](#controller)'s connect method.
3. Setup with CapTP using the session deliver spawned in step 1 and the
resulting session deliver provided in response to step 2 a mechanism for CapTP
to send and receive messages.

# Relay netlayer

The relay netlayer is a composition of the
[underlay netlayer](#underlay-netlayer) and the
[Noise netlayer](./noise.md). The Noise netlayer should have the symbol
used within the OCapN Locator's `transport` field be `relay` instead of the
default `noise` symbol.

# Funding

This project was funded through the
[NGI0 Commons Fund](https://nlnet.nl/commonsfund), a fund established by
[NLnet](https://nlnet.nl/) with financial support from the European Commission's
[Next Generation Internet](https://ngi.eu/) programme. Learn more on the
[NLnet project page](https://nlnet.nl/project/OCapN-federatedrelays/).

[<img src="https://nlnet.nl/logo/banner.svg" alt="Logo NLnet: abstract logo of four people seen from above" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGI0CommonsFund_tag.svg" alt="Logo NGI Zero Commons Fund: letterlogo shaped like a tag" width="20%" />](https://nlnet.nl/commonsfund)
