# OCapN network suite

## What is this?

OCapN stands for "Object Capability Network".
OCapN provides:

 - An implementation of the
   [CapTP](http://erights.org/elib/distrib/captp/index.html)
   "Capability Transport Protocol" abstract protocol, as the shining
   heart of OCapN.
   This protocol allows for networked programming which, with the
   appropriate tooling, has the convenience of programming against
   "networked objects" which are little different from any other
   asynchronous programming in the host language.

 - A generalized "netlayer" interface and specifications of compatible
   implementations.
   OCapN's CapTP can be run over different "netlayer" implementations
   ranging from [Tor Onion Services](https://2019.www.torproject.org/docs/onion-services.html.en)
   to [IBC](https://ibcprotocol.org/)
   to [I2P](https://geti2p.net/)
   to perhaps carrier pigeons with backpacks full of encrypted microsd
   cards.

 - A URI structure for addressing machines and specific objects on machines.

 - Not [one](https://www.poetryfoundation.org/poems/45474/o-captain-my-captain),
   but [two](https://www.merriam-webster.com/dictionary/netlayer)
   nautical naming puns.

OCapN is still pre-specification, and will likely be the output of
examining to what extent the
[Agoric](https://agoric.com/), [Spritely](https://spritelyproject.org/),
and potentially [Cap'N Proto](https://capnproto.org/) implementations
can be unified (with significant help and review from the
[Metamask](https://metamask.io/) team).

## What do I get from using this?

You get:

 - A general distributed communication API.

 - In host language environments which follow the object capability
   security paradigm (**TODO:** link which writeup?), programmers can
   write networked systems with security properties that are easily
   reasoned about.  The abstraction gain of having this layer
   generalized is similar to the gains of having TCP and TLS be
   general layers that each program does not have to re-implement:
   programmers can focus on the particular details that are relevant
   to their particular program.

 - Distributed (acyclic) garbage collection.
   Nodes can cooperate to inform each other when they no longer need
   references across the network.

 - Network layers supporting live connections (tcp-like), store and
   forward networks, and even communication between blockchains.

 - The abstraction of machines on the network supports both
   traditional single-hardware-unit computers, quorums of machines
   running the same abstracted machine, or blockchains with
   global-scale consensus.

 - [Promise pipelining!](http://www.erights.org/elib/distrib/pipeline.html)

   > Machines grow faster and memories grow larger.
   > But the speed of light is constant and New York is not getting any"
   > closer to Tokyo.
   >
   >   -- [Mark S. Miller's dissertation](http://www.erights.org/talks/thesis/)
   >      explaining the value of promise pipelining

(Why distributed *acyclic* GC?
[Distributed cyclic garbage collection](http://erights.org/history/original-e/dgc/)
was implemented in the pre-open-source version of E.
However, it requires special hooks into the garbage collector, whereas
distributed *acyclic* gc merely requires weakrefs, weakmaps, and
finalizers.)

## History

CapTP is something which has been implemented many times.
The first "open" version of CapTP was implemented in the
[E programming language](http://www.erights.org/)
(which itself was a continuation of the technical core of the
ambitious [Electric Communities Habitat](https://www.youtube.com/watch?v=KNiePoNiyvE)
distributed virtual worlds project),
though there have been many other (but incompatible) implementations
since, such as in [Cap'N Proto](https://capnproto.org/),
[Agoric's](https://agoric.com/)
[current implementation](https://github.com/Agoric/agoric-sdk/tree/master/packages/captp),
and [Spritely's](https://spritelyproject.org/)
[Goblins implementation](https://docs.racket-lang.org/goblins/index.html).
We are hoping to unify our work in the OCapN project.

CapTP usually comes with some other pieces.
The original implementation of CapTP was part of a suite called
"Pluribus" (with E and Pluribus being two parts of the joke "E
Pluribus Unum"); "OCapN" is thus the equivalent of "Pluribius".
If you are familiar with the original CapTP work, you can think of the
"netlayer" abstraction as being what used to be called
["VatTP"](http://erights.org/elib/distrib/vattp/index.html),
but generalized to permit multiple network transports.

When distinguishing from previous implementations, this particular
implementation of CapTP should be called "OCapN CapTP".

([Waterken](http://waterken.sourceforge.net/) does not have all the
properties associated with CapTP, but nonetheless extended and
provided many significant ideas for current generational work.)

## What's the plan?

Different recent implementations have brought different things to the
table in terms of their implementations:

 - [Spritely](https://spritelyproject.org/)
   has the most pieces of CapTP (including distributed
   acyclic GC, handoffs) and the start of the "netlayer" abstractions
   and URI concepts.

 - [Agoric](https://agoric.com/)
   has been working to figure out how to do the work to treat
   blockchains as ordinary machines supporting distributed objects on
   the network using [IBC](https://ibcprotocol.org/)
   (and has most of the engineering talent who have implemented
   CapTP historically).

 - [Cap'N Proto](https://capnproto.org/) has an efficient implementation
   of CapTP with some different choices around memory management than
   the other two.
   Can this be merged with the other two approaches?
   We don't know yet... watch this space!

The plan is to get at least Agoric and Spritely's implementations
interoperable first before considering interoperability with Cap'N
Proto and before beginning any discussion of standardization.

For expedience, this repository is usually using Spritely's
implementation as the "jumping off point" for discussion, but pulling
in details from the other two implementations to seek unification.
This should not be interpreted as a value judgement about the quality
of implementations, but rather that at the time of writing since
Spritely has the most features, it's the easiest place to start
talking from.
