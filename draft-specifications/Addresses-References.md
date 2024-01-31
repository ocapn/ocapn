# Warning: This is a draft specification likely to undergo significant change

This draft specification has been written in anticipation of implementation
by both Spritely Goblins and Agoric’s Endo Daemon and is a counter-proposal to
[Locators](Locators.md).
Over time this document will change, likely significantly as the group
converges on the design of OCapN. If you're interested in being part of that
work, please join!

Authors: Jessica Tallon, Christine Lemmer-Webber, Kris Kowal, & The OCapN
Pre-standardization Group.

# [Introduction](#introduction)

OCapN nodes can exist in a wide variety of network environments including
servers, laptops, web pages, web extensions, and mobile apps.
OCapN can connect any pair of nodes that can establish a session and exchange
messages, though each node may support different network layers.
For example, a web page might only be able to reach out with a WebSocket,
which dictates TLS, a signed cerificate, and handles message framing.
A mobile app might be able to reach out with a wide variety of transport and
message framing protocols, but require a relay or peer to peer mesh to accept
connections.
Web pages and extensions can connect to each other with a MessagePort, and
extensions can connect to local applications with host messaging.
Host messaging brings its own message framing protocol.

So, nodes must have the option of accepting connections over multiple
network layers and, when requesting a connection, be able to filter addresses
for mutually supported network layers.
The variety of OCapN network layers must be sufficient to construct a graph
from this variety of OCapN nodes and be able to evolve over time.

# Additional Documents

This document does not stand alone, it relies upon multiple other documents
which together build up OCapN  (Object Capability Network) specifications.

This specification uses the following other specifications:

-   [Syrup](): The serialization format used to encode the in band
    representation of the locator. 
-   [Tagged Netstring](https://web.archive.org/web/20140210012056/http://tnetstrings.org/):
    Specification for message framing.
-   [OCapN Netlayers](): Specification to open a secure communication channel
    between two sessions, often on different networks.
-   [RFC3986: Uniform Resource Identifier (URI): Generic
    Syntax](https://www.rfc-editor.org/rfc/rfc3986): For encoding URI
    representations of locations.

# [Abstract](#abstract)

An OCapN **address** provides a node with all the information it needs to
establish a session with another node.
An address consists of the name of a network layer and transport-specific
details.
The name of the network layer captures multiple dimensions:

- a **transport protocol** like TLS or Tor,
- a **message framing protocol** like Netstring,
- or, a combination of transport protocol and message framing protocol
  like WebSocket over HTTP over TLS,
- a **version** like CapTP Version 0

An **reference** has an identifier and must have at least one address.

- an **identifier** (string, typically a [Swiss
  Number](http://wiki.erights.org/wiki/Swiss_number))
- a list of **addresses** (strings)

To send messages from one node to a reference in another node,
the sender must establish a session with a protocol that both the sender
and receiver support.

> For example, if the sender node is a web page and the reference on a web
> server, these nodes might both be able to connect using version 1 of
> OCapN and rely on WebSocket for message framing and HTTP with TLS and a
> Certificate Authority for transport.
> The server might also provide addresses for that reference for TLS with a
> Diffie-Helman key exchange, Netstring for message framing, and OCapN versions 1
> and 2 for CapTP.

# Network Layers

OCapN specifies the names of multiple addressable network layers.
A node may have multiple network layers and a reference may have multiple
addresses and multiple addresses may share a network layer.

## TCP with Syrup, Version 0

For testing purposes only, the network layer named `tcp-syr0` combines:

* TCP for sessions,
* Netstring for message framing,
* Syrup OCapN Version 0 (draft)

> We advise the TCP transport to listen specifically on IP `127.0.0.1` (rather
> than the typical default of `0.0.0.0`) to make the node unreachable from
> other hosts and avoid use on multi-tenant hosts.
> For private connections between a user and a user-agent on a multi-tenant
> system, relay OCapN through a UNIX domain socket or a Windows named pipe.

The Syrup serialization is a record with the symbol `'tcp-syr0` followed
by a TCP address, including the port.
This network layer does not have a default port.

```
<'tcp-syr0 host> ; string
```

The JSON serialization is an object where:

* The `protocol` is `tcp-syr0`.
* The `host` is the TCP address of the node, including the port.

The URL serialization:

* The `protocol` is `tcp-syr0`.
* The `host` is the TCP address of the node.

> For example, `tcp-syr0://127.0.0.1:32768` is the address of a node reachable
> locally on port 32768.

## Tor with Syrup, Version 0

The network layer named `tor-syr0` combines:

* Tor for sessions,
* Netstring for message framing, and
* Syrup OCapN Version 0 (draft)

The Syrup serialization is a record with the symbol `'tor-syr0` followed by an
onion address (as a string), including the `.onion` virtual top-level-domain.

```
<'tor-syr0 onion> ; string
```

The JSON serialization is an object:

* The `protocol` is `tor-syr0`.
* The `address` is the string onion address, including the `.onion` virtual
  top-level-domain.

The URL serialization:

* The `protocol` is `tor-syr0`.
* The host is the Tor onion address, including the `.onion` virtual
  top-level-domain.

> For example, `tor-syr0://b0b5c0ffeefacade.onion` is the address of an OCapN
> node reachable over Tor with the hidden service onion address
> `b0b5c0ffeefacade.onion`.

## TLS WebSocket with Syrup, Version 0

The network layer named `wss-syr0` combines:

* Signed Certificate TLS for sessions,
* HTTP for transport,
* WebSocket for message framing, and
* Syrup OCapN Version 0 (draft)

In all serializations, the `href` is a WebSocket URL and the default port is
443.

The Syrup serialization is a record with the symbol `'wss-syr0` followed
by the corresponding WebSocket URL.

```
<'wss-syr0 href>
```

The JSON serialization is an object:

* The `protocol` is `wss-syr0`,
* The `href` is the WebSocket URL.

> For example, `{"protocol": "wss-syr0", "href": "wss://example.com"}`.

The URL serialization:

* The `protocol` is `wss-syr0`,
* The corresponding WebSocket address for establishing a connection is
  identical except with `wss` for the `protocol`.

> For example, `wss-syr0://example.com` is the address of an OCapN hosted by
> `https://example.com` with the address `wss://example.com` such that a connection
> can be established with `new WebSocket('wss://example.com')`.

# Reference URL Serialization

The URL serialization enables users to bootstrap CapTP sessions out-of-band.
Many operating systems allow applications to install custom protocol hooks and
recognize URIs in content.

For an OCapN URL:

* The `protocol` is `ocapn:`.
* The URL does not have an `origin`.
* The `pathname` is the **identifier**.
* The search params include any number of `address` entries, each of which is
  itself a URL but encoded as a URI component.

> For example, `ocapn:b0b5c0ffeefacade?address=tcp-syr0:127.0.0.1:32768` is a reference to
> the value with the identifier `b0b5c0ffeefacade` on a node that can
> be reached by connecting to TCP port 32768 on IP address `127.0.0.1` using
> Netstring message frames and OCapN CapTP Version 0.
> 
> For a server that accepts connections over both WebSocket and Tor, the URL would
> include both addresses.
> 
> ```
> ocapn:b0b5c0ffeefacade?address=tor-syr0%3Ab0b5c0ffeefacde.onion&address=wss-syr0%3A%2F%2Fexample.com
> ```

# Funding

This document has been written with funding through the [NGI Assure Fund](https://nlnet.nl/assure), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more on the [NLnet project page]( https://nlnet.nl/project/SpritelyOCCapN#ack).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGIAssure_tag.svg" alt="NGI Assure Logo" width="20%" />](https://nlnet.nl/assure)
