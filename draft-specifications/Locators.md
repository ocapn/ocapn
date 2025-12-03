# Warning: This is a draft specification likely to undergo significant change

This draft specification has been initially written based on Spritely Goblin's
implementation of as a base for the [OCapN pre-standardization
group](https://ocapn.org) to work from. Over time this document will change,
likely significantly as the group  converges on the design of OCapN. If you're
interested in being part of that  work, please join!

Authors: Jessica Tallon, Christine Lemmer-Webber & The OCapN Pre-standardization
Group.

# [Introduction](#introduction)

OCapN Locators used to identify OCapN capable peers or objects available on a
specific peer. They can be used in band as Syrup encoded data or out of band
when bootstrapping a connection as URIs.

These locators are agnostic to the netlayer that the peer or object is located
on, it encodes the transport  protocol name, key and other additional data which
would be used by any given  netlayer to reach the peer.

# Additional Documents

This document does not stand alone, it relies upon multiple other documents
which together build up OCapN  (Object Capability Network) specifications.

This specification uses the following other specifications:

-   [Syrup](): The serialization format used to encode the in band
    representation of the locator. 
-   [OCapN Netlayers](): Specification to open a secure communication channel
    between two sessions, often on  different networks.
-   [RFC3986: Uniform Resource Identifier (URI): Generic
    Syntax](https://www.rfc-editor.org/rfc/rfc3986): For encoding URI
    representations of locations.

# [peer Locator](#ocapn-peer)

This identifies an OCapN peer, not a specific object. This includes enough
information to specify which netlayer and provide that netlayer with all of the
information needed to create a  bidirectional channel to that peer.

The peer locator include the following pieces of information (more details
below):

- **Designator**: Usually representing the key, however can be any value
  determined by the netlayer
- **Transport**: A unique identifier to specify a netlayer
- **Hints**: A hashmap of additional connection information.

When comparing two peer locators, the designator and transport are the only
pieces of information which need to match. Two peer locators can have the same
designator and transport but  different hints and be considered to be the same
peer.

## [Syrup Serialization](#peer-syrup-serialization)

It's encoded as a record with the label `ocapn-peer` (symbol) and three
arguments:

```
<ocapn-peer transport   ; symbol (cannot contain ".")
            designator  ; string
            hints>      ; struct | false
```

### Hints

The hints are a [struct](https://github.com/ocapn/ocapn/wiki/Abstract-Syntax#struct-json)
which encode additional connection information that the netlayer might need to
reach the peer. There can be any number of hints, including none at all. If no
hints are used this field can be set to false.

## URI Serialization

The URI serialization is a URI form designed to be provided to users to be given
out of band to bootstrap a CapTP session.

The URI format is as follows:
```
;; Without hints (i.e. hints are set to false)
ocapn://<designator>.<transport>

;; With hints
ocapn://<designator>.<transport>?hint1=value1&hint2=value2
```

This is a URI with the scheme `ocapn` followed by the designator, a `.` and then
the transport name. If any  hints exist they're added as part of the query
parameters, otherwise emitted. 

Note that the designator permits `.` to be used within it, however the final `.`
should designate the separator  between the designator segment and the transport
identifier.

# Sturdyref Locator

A sturdyref locator includes a [Peer Locator](#peer-locator) and
a `swiss-num` which represents a specific object located at that
peer. This should be considered a capability with this information
alone being used to obtain a CapTP reference the given object.

The pieces of information encoded in the sturdyref are:

- [Peer Locator](#peer-locator)
- Swiss number: string used to obtain an object

## Syrup Serialization

It's encoded as a record with the label `ocapn-sturdyref` and two arguments:

```
<ocapn-sturdyref peer swiss-num>
```

The arguments are:

- **peer**: Syrup record defined in the [Syrup serialization of the peer locator](#peer-syrup-serialization)
- **swiss-num**: String which identifies the object.

## URI Serialization

The URI format follows a similar format to the peer URI format, except with a
"/s/" suffix to denote that it's a sturdyref, followed by the swiss number
value. Any hints are placed at the end of the URI.

The URI format is as follows:
```
;; Without hints (i.e. hints are set to false)
ocapn://<designator>.<transport>/s/<swiss-num>

;; With hints
ocapn://<designator>.<transport>/s/<swiss-num>?hint1=value1&hint2=value2
```

Any value within any string should be escaped, if needed, according to RFC3986.

# Funding

This document has been written with funding through the [NGI Assure Fund](https://nlnet.nl/assure), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more on the [NLnet project page]( https://nlnet.nl/project/SpritelyOCCapN#ack).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGIAssure_tag.svg" alt="NGI Assure Logo" width="20%" />](https://nlnet.nl/assure)
