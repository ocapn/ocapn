# Warning: This is a draft specification likely to undergo significant change

This draft specification has been initially written based on Spritely Goblin's
implementation as a base for the [OCapN pre-standardization
group](https://ocapn.org) to work from. Over time this document will change,
likely significantly as the group converges on the design of OCapN. If you're
interested in being part of that work, please join!

Authors: Jessica Tallon, Christine Lemmer-Webber & The OCapN Pre-standardization
Group.

# Additional Documents

- [OCapN Locators](): Representation of object references for both in-band and
  out-of-band usage.

# Introduction

OCapN Netlayers are the transport layer which ensures messages are sent and
delivered to a peer. The requirements put upon netlayers is very low and thus it
should be flexible enough for new netlayers on a lot of different transport
protocols. CapTP is designed in such a way that it is agnostic over which
netlayer it is using and designed in such a way that multiple different
netlayers could be used at the same time between different peers.

## Properties of a netlayer

A netlayer should ensure the following properties are provided:

- Bidirectional transmission and receipt of messages
- Messages sent should be delivered while the session remains active
- Messages should be received in the order in which they were sent
- The session must be secure in that messages can only be inserted by the
  participants in the session

Properties that are considered important to the operating principles of OCapN,
but are not technical requirements for a compliant netlayer, are:

- The reachability of peers without further configuration by any peer within the
  scope of the network they operate on.

Other properties may be desirable, however not strictly nessesary to comply with
this specification, these may include:

- That messages are encrypted or otherwise unaccessable other peers who are not
  the recipient

## Information a netlayer must provide

Netlayers could come in any shape and size from attaching messages to carrier
pidgeons (with system to check they're not lost on route, of course), to over
Libp2p, Tor Onion services, or even TCP. A netlayer should specify all the
information required for new implementations to exist and communicate with other
implementations of that same netlayer provided they operate on the same network.

Other information that must be provided is the information which should be
encoded within an OCapN peer locator, this is:

- Designator
- Transport
- Hints

Since hints is just a mapping of information, this should be flexible to include
any additional information that's required to route to and initialize a session.

Note: the `designator` field conventionally is a self-authenticating designator,
such as a cryptographic public key, however this is not required. It is
important and worth noting that the designator and transport alone MUST be
enough to differenciate between two locations, hints are not used for that.

# Tor Onion Netlayer

This is a netlayer which uses the [Tor Onion](https://www.torproject.org/)
network to provide a connection. The tor network provides the following
properties:

- Strong encryption
- Strong anonymity
- Routing to any peer hosting a hidden service on the network

These properties can be very useful for a lot of applications, however it should
be noted that the tor onion netlayer can suffer from several drawbacks such as
speed so might not be suitable for all applications.

## Implementing the netlayer

The implementation of the tor network is out of scope for this document. This
document relies upon the functionality provided by an underlying Tor Onion
services implementation.

When creating and decoding the OCapN locator, the following information is used:

- **designator**: The Service ID that is provided when generating the hidden
service.
- **transport**: The symbol `onion`
- **hints**: Hints are not used, so this may be set to false/omitted.

The "hidden service" facility is used to create a CapTP peer. The hidden service
should be hosted on the port `9045` and using "ED25519-V3" for the key type.
Upon creation of a hidden service tor provides the "Service-ID", this must be
supplied as the "designator" in the OCapN peer Locator.

# TCP Testing Netlayer

This is a netlayer designed only for testing purposes. It's designed to be simplistic
and relatively easy to implement. This comes at the expense of providing no security
or anonymity whatsoever, and thus must only be used in a testing environment.

## Implementation

The TCP netlayer relies on TCP sockets bound to an IPv4 address and port. The
implementation should listen and accept all incoming connections to the peer and
open new outbound connections when required by CapTP.

The OCapN Locator is as follows:

- **designator**: A unique string which will identify the peer.
- **transport**: The symbol `tcp-testing-only`
- **hints**: The hints are a OCapN Struct with two keys:
  - **host**: This should a string representation of an IPv4 address to be used to
reach the peer.
  - **port**: The port that should be used when connecting to the peer.

All messages are sent encoded with Syrup.

# Funding

This document has been written with funding through the [NGI Assure Fund](https://nlnet.nl/assure), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more on the [NLnet project page]( https://nlnet.nl/project/SpritelyOCCapN#ack).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGIAssure_tag.svg" alt="NGI Assure Logo" width="20%" />](https://nlnet.nl/assure)
