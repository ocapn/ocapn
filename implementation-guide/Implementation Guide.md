# OCapN Implementation Guide

OCapN, the **O**bject **Cap**ability **N**etwork, is a set of specifications which describe a protocol for writing distributed peer-to-peer applications. These specifications provide everything from creating a communication channel, to sending messages between objects across a network, and handing off to an object on a third peer on the network. The messaging paradigm is built on the idea of the actor model which has different objects (actors) which exist on multiple computers and can send messages to actors either locally or remotely.

The three specifications that make up OCapN are:

- **CapTP**: The object/actor-level distributed messaging system which builds upon a network agnostic communication channel, abstracted over the OCapN Netlayers.  CapTP provides:
  - A general inter-object networked messaging protocol.
  - A powerful capability security model which is intuitive to ordinary programming interactions.
  - Distributed, cooperative garbage collection.
  - First-class promises and promise pipelining, allowing for efficient communication with to-be-created objects before they even exist and propagating information about message failure to relevant interested parties.
  - A peer introduction mechanism known as "handoffs" which allows users to continue to program with the intuition of ordinary programming even when communicating with multiple peers that do not yet know about each other.
- **OCapN Netlayers**: The lower level standard for defining different network specific implementations of the communication channels, on top of which CapTP sends messages. Netlayers provide a unified abstraction upon which CapTP can operate without having to decide a particular underlying networking protocol.
- **OCapN Locators**: In-band and out-of-band descriptors of OCapN capable peers and objects.

## Introduction

The OCapN specifications provide a generalized distributed object communication system. The specifications correspond to an underlying abstract model of computation where each peer on the network contains objects exported to other specific peers on the network which import them. While many peers on the network connect to many other peers, the set of exported objects which may be operated upon are dependent on the interactions between the objects on those two peers, i.e. different peer pairs will have different exports... not all peers get access to all objects. The idea is that a distributed network is like a society of inter-cooperating objects/actors with different sets of relationships and cooperation between the objects/actors contained on different peers.

This perspective is pervasive throughout OCapN's design and even its narrative and visual imagery, as will be seen throughout this document. In terms of server-to-server interactions, OCapN can protect against objects being exposed across a network boundary which were not consensually shared with that peer. On a more fine grained level, implementations which partition their internal behavior in terms of objects will have a smooth and intuitive model for partitioning and coordinating access granting between system subcomponents resembling ordinary programming. (Here "objects" are refer to encapsulated state and behavior accessible only through a reference, not referring to any idea of "object oriented" in terms of class heirarchies, which many implementations of OCapN do not use.)

Of course, there is no way to enforce at a network level that other peers correspond to the operational semantics described in this document in terms of their internal operations and behavioral partitioning. However, implementations of OCapN which do follow these ideas will reap great benefits: OCapN, in conjunction with an implementation which follows its abstract semantics, allows programmers to write applications which look equivalent for asynchronous programming on a single computer as well as asynchronous programming across a fully distributed network. Programmers using such a programming environment can focus on the underlying core ideas and behaviors of their programs rather than on network programming details. In other words, safety and security become intuitive outcomes of ordinary argument passing in programming following the simple object capability paradigm of "if you don't have it, you can't use it".

## Implementing OCapN

This is an opinionated guide on how a prospective implementer could go about implementing a fully complaint CapTP implementation. It's highly recommended to read through the specifications before using this guide as it's good to get a sense for what is required by the specification, opposed to what is suggested by this guide. 

To help implementation we've broken this guide into distinct steps which can be tested on their own against the OCapN test suite.

### Stage 0: connect, op:start-session, op:abort + netlayers ("laying the foundation")

Alisha wants to connect to her friends Ben and Carol who are already on the OCapN network and also wants to begin programming her own implementation of OCapN in the process. In order to connect to her friends' peers on the network, she must first bootstrap her connection.

In this stage we'll cover:

 - Implementing a very basic netlayer
 - OCapN peer locators
 - Starting the session with `op:start-session`
 - Terminating the session with `op:abort`

#### Implementing a basic netlayer

Netlayers are just a channel between two "peers" which speak CapTP. These peers could be on the same virtual or physical machine, same local network or on the other side of the world. Netlayers are designed to abstract away the logistics of sending and delivering messages away from CapTP and provide an agnostic concept of a channel which is a bidirectional FIFO. Thus CapTP is itself agnostic to the underlying network protocol, with individual netlayers providing different characteristics around latency, liveness, privacy, and general mechanism.

Every netlayer ultimately provides a bidirectional channel between two peers on the network. Alisha both needs to be able to accept connections from the network who are connecting to her peer and she needs be able to open outgoing connections to other peers which her ocapn-using programs are requesting to connect to on the network. In both cases, the netlayer ultimately hands to CapTP a mechanism for receiving and being informed of new messages and a mechanism for sending messages. The netlayer need not be concerned with the details of the messages transmitted after it has completed setting up a connection, it only needs to be concerned with passing messages around.

Alisha decides to implement the Tor Onion Services netlayer as a first step because Tor takes care of the difficult aspects of peer-to-peer connections. To do this she implements her netlayer to talk to the Tor control socket both registering her process to be able to accept new connections for a particular network identity and adds control code for making outgoing connections also speaking through the control socket. When the netlayer is instantiated and configured, it provides two functions:

- `new_outgoing_connection(ocapn_locator)`: This function speaks to the tor daemon to open a new connection to the specified [OCapN locator](https://github.com/ocapn/ocapn/blob/main/draft-specifications/Locators.md) and returns a socket she can use to read and write messages from and is called from CapTP.
- `accept_incoming_connection()`: This function will wait for a new incoming connection to her peer and return it. She knows that she'll need to hook this up to run in its own thread and waiting for connections and then initiating new sessions in her CapTP implementation.

#### Starting and terminating sessions

Once a new connection has been established by the netlayer, the netlayer hands the rest of the work over to the CapTP implementation to complete configuring an active session.

CapTP needs to ensure that only a single active session exists between two peers addressable on the network. This prevents unnecessarily opening many duplicate connections, permits reusing the same live object references when referring to the same live objects, and permits assertions that two objects that have the same object identity also have same live reference identity.

The first messages exchanged over a CapTP session are to initialize the CapTP session. This is done with the `op:start-session` message. The message is a record which has the following structure:

```
<op:start-session captp-version             ; String value
                  session-pubkey            ; CapTP public key value
                  acceptable-location       ; OCapN Reference type
                  acceptable-location-sig>  ; CapTP signature
```

This message includes several important pieces of information to allow each side to perform the following:

 - The message establishes which version of OCapN's CapTP is being used, ensuring that both sides are speaking a compatible revision of the protocol
 - The message provides a `session-pubkey` which is encoded public key cryptographic information used for signatures. This key is always part of a freshly generated keypair which is **never reused** outside of this particular session (and of which the corresponding signing key is kept private to the respective side of the connection).  (**NOTE:** if a new session is ever established between two peers on the network, this keypair MUST NOT be reused.) This key is used for:
   - Creating a distinct identifier for this side of the session
   - Creating a distinct identifier for identifying the session as a whole, created by sorting, combining, and hashing both sides of the connection's provided pubkeys
   - Performing signature verification for third-party handoffs (as described later in this document)
 - The `acceptable-location` is used to perform handoffs (more in the handoff section) and to identify the peer in a unique way so only one connection is opened to a given peer.
 - The `acceptable-location-sig` allows the peer to demonstrate to us that it controls the private key part to the public key specified in `session-pubkey`

Alisha writes code to generate a key pair for the session, keeping the private key secret to her side of the session and formatting the public key for the `op:start-session` message. She uses the private key she just generated to sign her `acceptable-location` wrapped within a `my-location` record and provides this signature for the `acceptable-location-sig` field. (The purpose of wrapping within the `my-location` record is to provide sufficient context to [prevent context confusion vulnerabilities](https://sandstorm.io/news/2015-05-01-is-that-ascii-or-protobuf).)

With this in place she can generate her `op:start-session` message, which looks like this:

```
<op:start-session "1.0"
                  (public-key (ecc (curve Ed25519) (flags eddsa) (q ...)))
                  (ocapn-peer "..." 'onion #f)
                  (sig-val (eddsa (r ...) (s ...)))>
```

Alisha transmits this message to the other side of the prospective session. She then reads on the channel provided by the netlayer looking for the remote peer's `op:start-session` message. Alisha verifies that the `acceptable-location-sig` signs the `acceptable-location` wrapped within a `my-location` record by using the other side's provided `session-pubkey`.

*In the future when location verification is implemented and agreed upon, a description of this step will be explained here.*

Having tested the above against connecting to Ben's OCapN peer locator, Alisha is satisfied that her implementation is able to successfully establish a connection. She needs to ensure that her implementation of CapTP only has one active session between her peer and a given remote peer, so she two tables to help keep track of them:

- Table of active sessions (remote location -> session)
- Table of outgoing sessions (outgoing location -> key pair)

The first one she uses to store a session once it's been fully initiated and set up. Anytime she needs to open a connection to a new peer, she'll be able to check this table to see if a connection already exists, permitting reuse of already established sessions.

The second table is used to help her mitigate the crossed hellos problem (previously called [the crossed connections problem](http://erights.org/elib/distrib/vattp/DataComm_startup.html)). Alisha knows this problem occurs when her CapTP implementation begins initiating a connection at the same the other side is also opening a connection to Alisha's peer. The way CapTP solves this is by keeping track of any session your side opens (outgoing) and then anytime you get an incoming connection you must check to see if you're currently in the process of setting up an outgoing session. If this is the case, we have established that it's the crossed hellos problem and both sides will need to establish which of the two sessions continue. CapTP resolves this by calculating an ID for each session, the ID is calculated based on the `session-pubkey` and a hashing step, Alisha finds the exact algorithm in the CapTP specification and implements it. Once she has the IDs for both her outgoing session and the incoming session, she sorts the serialized IDs and aborts the lower of the two sessions.

In order to abort a session we must notify the other side. This is done with the `op:abort` message. The message is a record which has the following structure:

```
<op:abort reason>  ; reason: String
```

Alisha decides that in the case of crossed hellos, the session she needs to terminate will issue the following message:

```
<op:abort "Crossed hellos mitigated">
```

*CapTP leaves the text of the abort message up to the implementation, even in defined cases such as crossed hellos*


### Stage 1: op:deliver-only, sturdyrefs, import/export

In stage 0, Alisha was able to have her session establish a channel and initialize a CapTP session, but the only thing she has been able to with her implementation so far has been to abort it. She'd like to be able to connect to her friend Ben and ask him if she can try out one of his new robots. Ben has given her his sturdyref, but to use that she'll need to add support in her implementation to:

- Decode and enliven sturdyrefs
- Export the bootstrap object at position 0
- Have a bootstrap object to provide fetching objects
- Support `op:deliver-only` to send messages to objects

#### Sturdyrefs

Studyrefs are a type of OCapN locator that is used to encode an object on a specific peer. They can be encoded as a record which has the following structure:

```
<ocapn-sturdyref peer        ; ocapn-peer record
                 swiss-num>  ; Binary data which identifies a specific object
```

Alisha has a sturdyref locator, but said locator is encoded as a string as Ben shared it to her outside of OCapN. The mapping between the string and record encodings are defined in the [OCapN Locators](https://github.com/ocapn/ocapn/blob/main/draft-specifications/Locators.md) specification, so Alisha implements a conversion between the two encodings so she can use that to get it to the more native representation. She takes the information encoded in the OCapN peer locator to form a session using her existing CapTP implementation, but she needs to be able to reference the object specified by the `swiss-num`.

She knows the steps to getting a reference to this object so she can send messages is as follows:

1. Ask the bootstrap object for the object by using its `fetch` method
2. Keep track of the object so she can use it.

And of course she also knows she needs to implement message sending too.

#### Importing and Exporting

![](./handoffs-2party1.webm)

In order for Alisha to begin sending messages on CapTP, she'll need a reference to objects. CapTP does this by `exporting` and `importing` objects, when sending messages across CapTP however, this can at first seem confusing because if an object is being exported or imported depends who's perspective you're looking at it from. In CapTP that everything is described from the receiving point of view. CapTP also needs a way of referring a specific object which has either been imported or exported, this is done by assigning a each object a number, the specific number doesn't really matter, so long as it's unique to the object within this session.

CapTP describes object across the network with descriptors, these descriptors include a positive integer which is unique to the specific object and used when referring to the object, the desciptors Alisha needs to implement are as follows:

```
<desc:import-object position>
<desc:export position>
```

To give an example of this, let's say there are two peers, Peer A with two objects Alisha and Arthur and Peer B with Ben. Peer B is exporting the object Ben at export position 3, when Peer B refers to this reference, his peer would use `<desc:export 3>`. Peer A is importing this reference to Ben, and would reference Ben by using `<desc:import-object 3>`. Now If we imagine Alisha sends a reference to Arthur (who lives on Peer A) to Ben within a message. This is done by Peer A exporting this reference to peer B so Ben can have this reference e.g.

```
<op:deliver-only <desc:import-object 3>> [<desc:export 4>]>
``` 

This is that `<desc:export 4>` is representing Arthur for Peer A.

Since there will be many objects both exported and imported on each CapTP session, Alisha decides to create two tables each time she initializes a CapTP session to keep track of these objects. The first is an "import table" which will map the position and a "remote object reference" which she'll give to her actors, the second table is the "export" table which will map the position to the local reference of the object. Any objects she exports will be placed in the export table and any objects she imports will be placed in her import table.

#### Exporting the bootstrap object

As we've seen above the when an object is exported it's assigned a number, but the very first object ever to be exported is always the bootstrap object. The bootstrap object does what it sounds, it helps you bootstrap the connection enabling you to get a reference to an object on peer when you don't have any other references. As we have already seen in the sturdyref section, they contain a "swiss-num" part which is what is used with the bootstrap object to fetch the object. The bootstrap object has a method, methods are just normal message sends, except that the first argument of the list is a symbol which matches the method.

#### Delivering messages

The core of CapTP is being able to send messages to objects, there are two ways to do that:

- `op:deliver-only`: Just sends a message, not expecting any response from the object.
- `op:deliver`: Sends a message while setting up some promise machinery to get a reply from the object.

`op:deliver` is more complicated, so Alisha decides she can just start by implementing the basic `op:deliver-only` and worry about the other later. She looks up the operation in the specification and sees it has the following structure:

```
<op:deliver-only to-desc  ; desc:export
                 args>    ; Sequence
```

Alisha adds to her CapTP implementation a function to send a message which takes a reference to a remote object and some arguments she wishes to send it. It'll check that there's an object imported to her with that reference and at what position and then she'll create this record. She tests it out by trying to send a message to the bootstrap object's fetch method. She calls her function with the bootstrap reference she got and a list with two arguments, the first being the symbol `fetch` and the second being the `swiss-num` of the decoded sturdyref Ben gave her. She looks at the message:

```
<op:deliver-only <desc:export 0>
                 ['fetch "..."]
```

Okay, looks great. Alisha sends that... but she doesn't hear anything back. That's obviously to be expected since `op:deliver-only` doesn't ask for any response from the object. She decides to move on and implement `op:deliver` so she can get the reference to the robot.


### Stage 2: promises, op:deliver, op:listen

#### Promises

When sending messages, you often want a response from the object you are communicating with. If an object exists across the network it might take a while for the object to get the message and provide a response, it also might be the case that something goes wrong and the object isn't able to provide a response. In these situations it'd be good to setup some mechanism to be notified when that answer becomes available. In CapTP this feature is provided by promises. The functionality of a promise comes in two parts, sometimes called a promise pair, composed of:

- a promise (or vow): This is the an object which represents the eventual answer.
- a resolver: This is an object which accepts a resolution to a promise.

To implement proper promise handling, first Alisha creates create a local object for each promises she makes, this will be the "vow" in the promise pair. This promise object will just have some functionality to it to keep track of if it has a value and let her setup listeners so that she get notified when there's an result. She then implements the resolver which has a capability to provide the promise once with a result, it'll implement the two methods and it'll just give the promise the value and tell it to notify all its listeners. Once it's got it's resolution, it'll stop accepting new answers, just in case.

She uses her new version in her bootstrap code and it seems to work, so she tries implementing a basic `op:deliver` message, she looks and sees it has the following structure:

```
<op:deliver to-desc           ; desc:export
            args              ; sequence
            answer-pos        ; positive integer | false
            resolve-me-desc>  ; desc:import-object | desc:import-promise
```

The `to-desc` and `args` look familiar from before, but `op:deliver` has two new fields. The `answer-pos` is related to promise pipelining and that seems like functionality she doesn't need yet, so she just sets it to `false`. The `resolve-me-desc` is the resolver she implemented. She implements a function which like before takes a remote object reference and a list of arguments, except this time it'll return that vow she implemented. It sets up a promise pair and constructs this message using the resolver of the promise pair in the `op:deliver` message and returning the vow to the caller. She test this out with the bootstrap object on Ben's peer and the message it makes looks like this:

```
<op:deliver     <desc:export 0>
                ['fulfill "..."]
                false
                <desc:import-object 1>>
```

Okay, that looks good and she's got her vow back from it too. She tries sending that object and after a short time passes a message comes in from Ben's peer which reads:

```
<op:deliver-only    <desc:export 1>
                    ['fulfill <desc:import-object 1>]>
```

Great, Alisha has a reference to Ben's robot. Alisha wants to make an adjustment to her send message with response function so she allows it to take a vow object and the function will set itself up to listen for the response and when it comes it, it'll then send the message to the reference it's fulfilled with. Alisha wants to try asking the robot to beep, so she calls her send message with response function again, but this time using the vow to the robot. Since it's actually already resolved it immediately makes and sends the next deliver message:

```
<op:deliver  <desc:export 1>
             ['beep]
             false
             <desc:import-object 2>>
```

The message looks good, it seems to have made a new resolver object and exported that at the next available position and put it in the session's export table. After some time a new message comes in and it reads:

```
<op:deliver-only    <desc:export 2>
                    ['fulfill <desc:import-promise 2>]>
```

Cool! but wait, `import-promise`? The robot has created a promise to beep and send that. Okay, that's fine, she just has to listen to it like before. She looks at the CapTP specification and sees the `op:listen` operation, this lets her give a promise and setup a listener so it can respond. The `op:listen` operation looks like this:

```
<op:listen to-desc           ; desc:export | desc:answer
           listen-desc       ; desc:import-object
           wants-partial?>   ; boolean
```

So Alisha needs to send this operation to the promise which was exported to her with an object that wants to be notified. Fortunately that's just the same notification object that promises she implemented before has. Finally the promise has this `wants-partial?` boolean which will decide if she'll get updates even if it's just to another promise. She decides at her CapTP boundary look for `desc:import-promise` references and create a promise pair, she'll replace the references to the remote promise with her local one and transmit an `op:listen` with the resolver to the vow in the `listen-desc`, for `wants-partial?` she'll just leave that at false for now.

She sets up a promise pair and transmits `op:listen` for the promise she got earlier for the beep, the message like this:

```
<op:listen  <desc:export 2>
            <desc:import-object 3>
            true>
```

After another while she gets another message with the resolution to that promise:
```
<op:deliver-only    <desc:import-object 3>
                    ['fulfill "beeeep!"]>
```

Oh cool! that all worked. Now she has promises though she needs to modify how her `op:abort` works, before it just terminated the session if she got one, but now she has promises she needs to ensure they break if the session ends. She sets up the promise creation code to add her promise to a set of unresolved promises that her `op:abort` handling code can access. When the resolver gets the resolution, it removes itself from the set of unresolved promises. She next makes it so that when an `op:abort` comes in, she iterates through the set sending the resolver objects a break with a network partition error. This should ensure promises are handled correctly.

Promises might not only be fulfilled through, lets imagine that Alisha sents another message to move forward. Lets assume the robot can't do that, it doesn't really matter why, maybe the robot physically isn't able to move forward for there being an obstacle, maybe it's got low power, or some other reason entirely, but the promise she gets back instead of being resolved as fulfilled instead gets broken:

```
;; Alisha's message to the robot to move forward.
<op:deliver     <desc:export 1>
                '['move-forward 10]
                #f
                <desc:import-object 4>>

;; The robot's reply to the promise she created in the `op:deliver`
<op:deliver-only  <desc:export 4> ['break "Unkown error occured"]>
```

### Stage 3: import/export gc

Alisha looks at her export table and sees the following:

- `0 -> <bootstrap object>`
- `1 -> <bootstrap fetch resolve-me-desc>`
- `2 -> <robot beep resolve-me-desc>`
- `3 -> <beep's vow listen resolve-me-desc>`
- `4 -> <move forward resolve-me-desc>`

Alisha already has the reference to the robot, a promise for the response to the beep, and the robot has sent a resolution to the promise it sent Alisha with its reply, "Beeeep!" But these are a lot of objects still hanging around and being exported by both sides. Alisha decides it's time to implement garbage collection so that she may remove these from her table and it doesn't grow too large, ensuring also that Ben's peer doesn't have to hang on to all of these objects as well.

There are two garbage collection operations in OCapN's CapTP, but one of thse operations has to do with questions and answers and Alisha isn't doing anything with those yet. Alisha decides to look at the `op:gc-export` operation which looks like this:

```
<op:gc-export export-pos   ; positive integer
              wire-delta>  ; positive integer
```

The `export-pos` is the same position that's used for the import position and the wire-delta outstanding references to the object that's been received. OCapN's GC implementation is a collaborative process where by both sides keep track of the number of times a given object has been referenced in CapTP messages. When the importing side no longer needs the object, it should send an `op:gc-export` message, with the `wire-delta` being the outstanding reference count. Each time a reference to an object is received the CapTP session should keep track of this and can emit the `op:gc-export` with this amount and remove it from the count. The reason for keeping track of the wire-delta is the importing peer could no longer need the reference and send a GC operation while at the same time the exporting side might send another message which refers to that object, if the exporting side were then to get this GC operation, the exporting side needs to know if it's safe to actually GC it or not.

Here you can see two peers with a CapTP session Peer A and Peer B. On Peer A lives an object called `alice`, there are many messages that have referenced the `alice` object, two of which has been received by Peer B, three of which are still on the wire yet to be received. Peer B in this situation has incremented their reference count of alice twice as its seen two references and decides it no longer needs this object so emits a GC export. What would happen next would be three more messages referencing `alice` arrive, if Peer A got the `op:gc-export` message and then GC'd alice, this would be a problem for B.

Fortunately when Peer A receives the `op:gc-export` operation it can remove from its reference count the value conveyed in the `wire-delta` field which would leave Peer A with the value of `3`. Since this still leaves three references unaccounted for Peer A knows it cannot GC this object and must wait for Peer B to emit further GC export operations.

Alisha begins by two tables, one for keeping track of reference count for imported objects and one for exported objects. She makes it so that before transmission of any `op:deliver` or `op:deliver-only` she looks through all the arguments and everytime a reference is mentioned she increments the reference count in her export GC count table. She also implements a similar system to keep track of references in incoming messages.

Alisha's programming language supports garbage collection and allows her to register a function to be called as an object is freed. She registers one which emits a `op:gc-export` message with the `wire-delta` equal to the number of times she has outstanding references to the `op:gc-export` since the last time she sent a `op:gc-export` for the relevant imported object.

Alisha also implements the receiving side, each time a `op:gc-export` message comes in she decrements the wire-delta from her count and if the remaining count is zero, she removes the object from both her GC count table and the export table.

### Stage 4: promise pipelining

Promise pipelning is when you chain several promises together by sending `op:deliver`s to the promises creating further promises which can be further chained. This can be a powerful way to work with promises, allowing for increased efficiency and often can translate to improved code style for those programming against CapTP.

Using promise pipelining for this, instead of each time A waits for the response and then sends the next message, A can send all their messages to B at once, cutting down the number of round trips. Without promise pipelining a peer would have to wait for each reply before following up with a message to an object that will be created or referred to in response to a previous message, this would look something like this: `A => B => A => B => A`. With promise pipelining, a peer can simply refer to the promise and send or refer to that immediately, cutting down on round trips, this would look something like this: `A => B => A`.

For example, let's say Alisha wanted to create a file within a directory she has access to hosted on Ben's peer and then write some text to it. Without promise pipelining, Alisha would first send a message to create the directory (`A => B`), then set up a callback waiting for the new file's object reference (`B => A`), then Alisha can send a message with the data she would like to write (`A => B`), and finally she can set up a callback to receive a notification for whether the write succeeds (`B => A`). By contrast with OCapN's promise pipelining support Alisha can simply send the message to the directory to create the object and immediately send the instruction to the promise resulting from that operation (`A => B`) and then simply set up a callback listening to whether or not both operations are cumulatively successful (`B => A`).

CapTP supports promise pipelining using the `answer-pos` field in `op-deliver` and then allowing referencing of the answer using a special "answer descriptor", `desc:answer`. The `answer-pos` contains a unique (to the CapTP session) positive integer selected by the sender to describe the vow, this is then used with the answer descriptor to refer to the promise being created with the `op:deliver`. If the session wishes to promise pipeline on the answer, it can use the answer descriptor in the `op:deliver`'s (or `op:deliver-only`s) `to-desc` field. To show how the above would look in terms of messages A would be sending, it would look something like this:

```
<op:deliver <desc:export 1>
            []
            0
            <desc:import-object 1>>

;; Now we're sending a message to that promise
<op:deliver <desc:answer 0>
            []
            1
            <desc:import-object 2>>

;; Finally lets send a message to the promise above
<op:deliver <desc:answer 1>
            []
            2
            <desc:import-object 3>>
```

Alisha wants to support this mechanism so when a CapTP session is initialized she creates two further tables to facilitate this:

- Questions: This is to keep track of a mapping between a remote promise descriptor and the answer position
- Answers: This is used to keep track of position to local promises for received `op:deliver` calls.

Starting with questions Alisha modifies her function which creates the `op:deliver` message to add a unique integer for the `answer-pos` instead of the `false` she used earlier. She adds that integer to the questions table and returns her internal representation for this vow that she calls the remote promise descriptor. She also adds to her function the ability to pass in as the target of the message the remote promise descriptor and in that situation it'll check the answer table and send it to that position wrapped in the `desc:answer` record.

Alisha modifies both her `op:deliver` and `op:deliver-only` message handling code to check if the `to-desc` field is referring to an object or an answer. In the case it's an answer she looks up in her answers table and finds the local promise object which she sends the messages to so they get delivered when the promise is fulfilled. Alisha also adds to her `op:deliver` message handling code to check for if `answer-pos` is not null or false and if so stores the position in her answers table along with the promise created for the `op:deliver`.

### Stage 5: question/answer gc

When it comes to questions and answers those also can build up as the exporting peer can't know when they can be garbage collected. This is where the `op:gc-answer` operation comes in, this is sent by the questioner when it no longer needs the answer. Since the questioner both created the question and is the only side to use it, it's also the questioner's responsibility to notify the other side it can garbage collect it when no longer needed. Due to how questions and answers work with them only being used by the questioner, it allows the GC operation to be a lot simpler, it looks like:

```
<op:gc-answer answer-pos>  ; answer-pos: positive integer
```

Alisha sets up a hook to be called when her internal question representation is collected. When her hook is called she looks up the question in her questions table, getting the `answer-pos`and constructs and emits the `op:gc-answer` record. Alisha is now able to safely remove this entry from her answers table. Finally she also implements the other side adding some code to handle an incoming `op:gc-answer`, removing the answer from her answer table when this operation is received.

### Stage 6: 3rd Party Handoffs

An important feature of OCapN is that programmers need not worry about *where* objects live: a proper implementation of OCapN can provide the illusion of local asynchronous programming being identical in experience to networked asynchronous programming. Third Party Handoffs allows this illusion to be maintained even when messaging an object on a remote peer with a reference to an object on a completely different remote peer. Third Party Handoffs permit the illusion of one unified distributed asynchronous computer even with many collaborating entities which may previously have been unaware of each other, while preserving the safety properties of safe object capability collaboration that OCapN provides.

All this is achieved despite imports and exports being pairwise arrangements between peers on the network. As we've seen the way objects are shared is session specific positions in session specific import and export tables which doesn't allow for sharing these objects to a peer outside the session. OCapN's handoff mechanism uses certificates to bridge intentionally introductions over the network while preserving OCapN's fundamental pairwise import/export design in the general case.

Lets imagine that Alisha (Peer A) also knows Carol (Peer C). Carol has a gallery of interesting robot photos and is looking to grow so has asked Alisha if she can help. Since Ben (Peer B) has some amazing robots, Alisha decides to ask Ben if he's able to send some photos of his robot over to Carol. Alisha is able to do this without needing to worry if Ben knows Carol, she can simply share a reference to Carol's robot gallery on Peer C and Third Party Handoffs will ensure that Ben can secrely get the reference to the gallery.

Third Party Handoffs has certain terms that are important to understand when thinking about handoffs, using the the above example, we'll look at who is who from the prospective of Alisha giving Ben a reference to Carol's gallery:

- **Gifter**: This would be Alisha' Peer, Peer A it's the one initiating the handoff
- **Receiver**: This would be Ben's Peer, Peer B as it's the one getting the reference
- **Exporter**: This would be Carol's Peer, Peer C as it's the peer the reference that's being shared lives on

![](./handoffs-3party1.webm)

In a high level Alisha will deposit a "gift" which is just a reference to the gallery object on Peer C's gift table the session Peer A and Peer C have together. Alisha will then create a sort of certificate called a `desc:handoff-give` which includes important information from both peer A and peer C's session and peer A and peer B's session, as well as the ID of the gift she left at C. Peer B can create a connection to peer C if it doesn't already have one and create a certificate called `desc:handoff-receive` which includes the `desc:handoff-give` certificate A give B, this certificate it delivers to C and will get in return the gift if all went successfully.

That's a lot to take in so we can look at each step one by one and see what's actually happening. The first thing to do before that is to look at the message Alice sends to Ben, the `desc:handoff-give` is used in place of gallery object on Peer C the message conceptually would look like this:

```
<op:deliver-only <reference to Ben (desc:import-object)>  [<desc:handoff-give representing the reference to the gallery>]>
```

#### Depositing the gift

![](./handoffs-3party2.webm)

This is done by the gifter, in our example Alisha's peer, Peer A. Each peer needs a per-session gifting table which stores a gift ID to some reference to an object or promise. The gift ID is just a positive integer (usually incrementing integer) which is unique to the session which represents the reference being shared. When a handoff is initiated it's to a specific object on a peer, not just the peer, the gifting mechanism is providing a secure way to share a specific reference to the receiver. The way a peer deposits a gift is on the bootstrap object (on the exporter) which has a specific `deposit-gift` method.

Alisha starts implementing this by creating a gift table for each session and an auto incrementing counter to track the gift IDs she's sending. Alisha also implements the `deposit-gift` method on her bootstrap object which takes two arguments a gift ID and a reference and she puts these things into her gift table she's just made. Alisha then starts by adding code to her `op:deliver` and `op:deliver-only` to look through all the arguments being sent and when it encounters a reference to an remote object on a peer from a different session, she initilizes a handoff and replaces that reference with a `desc:handoff-give`. When a handoff is initialized in Alisha's system, it gets the current next gift ID and sends a message to the deposit gift method on the exporter's bootstrap object, this looks like this:

```
;; Deposit the object Peer C is exporting at position `1` at gift ID `5`
<op:deliver-only <desc:export 0> ['deposit-gift 5 <desc:export 1>]
```
 
#### Creating the `desc:handoff-give` certificate

![](./handoffs-3party3.webm)

Alisha next needs to create the `desc:handoff-give` certificate which she can give to Ben on Peer B which will enable him to retrieve the reference Alisha left as a gift on Peer C. The certificate has the following structure:

```
<desc:handoff-give receiver-key       ; the public key of the receiver in the gifter <-> receiver session
                   exporter-location  ; OCapN Locator for the exporter
                   session            ; The session ID for the gifter <-> exporter session
                   gifter-side        ; the public key of the gifter in the gifter <-> exporter session
                   gift-id>           ; Positive Integer or zero.
```

This includes a lot of information, some of which comes from the Gifter's session with the Receiver and some of it comes from the Gifter's session with the Exporter. It's important to keep in mind when thinking about handoffs is that it does not rely on keeping secrets, all messages sent can be public while remaining secure and handoffs are capabilities which only allow the receiver to obtain a reference to the object that the gifter deposits. The burden for checking the information within the certificates rests with the exporter since it is the Peer which has the reference to provide.

Alisha creates this certificate using the session information from both her sessions with Carol's Peer and Ben's peer. Once Alisha has the `desc:handoff-give` she signs it in a `desc:sig-envelope` with her peer's private key from her session with Carol's Peer (Peer A's private key in the Peer A <-> Peer C session). It might seem unusual to sign this handoff give that's being sent to Ben's peer with the key Alisha uses with Carol's Peer, but we must remember it's Carol's peer who must verify this signature and by doing this Peer C is able to verify that it was in fact Alisha's Peer which created this `desc:handoff-give`.

### creating the `desc:handoff-receive` certificate

![](./handoffs-3party4.webm)

The receiver doesn't just get the `desc:handoff-give` and pass it along, it generates its own certificate which includes the signed `desc:handoff-give`. The receiver does this to include some additional information only the receiver has that the exporter will need to securely perform the handoff. The certificate the receiver creates is called a `desc:handoff-receive` and looks like this:

```
<desc:handoff-receive receiving-session  ; The ID of the receiver <-> exporter session
                      receiving-side     ; The public key of the receiver in the receiver <-> exporter session
                      handoff-count      ; positive integer
                      signed-give>       ; desc:sig-envelope containing a desc:handoff-give received from the gifter
```

We can see the receiver adds some information, but most of it is provided already by the gifter and is included by including that signed certificate along with the `desc:handoff-receive` in the `signed-give` field. One piece of information that's included here is the `handoff-count`, each session has an inrecementing integer starting at zero which reflects how many handoff-receive's they've sent in the session. They also include an integer which reflects how many handoff receive's they've received (with them being the exporter) within the session. This is used to prevent replay attacks, the exporter must only provide the reference once to prevent replay attacks. The last thing to note here is this is also wrapped in a `desc:sig-envelope` with a signature, but this signature is created with the receiver's private key in the gifter <-> receiver session. Again, this might seem a bit strange for two reasons:

1. Again, we're sending the `desc:handoff-receive` to the exporter but using a key from another session, the gifter <-> receiver session.
2. Since these keys are per-session and generated anew on each new connection, the exporter normally would have no way to verify this signature. The gifter, however, included the receiver's public key they used within the `handoff-give` (the `receiver-key` field) that they signed. The exporter is able to extract this key from the `desc:handoff-give` and use it to verify the signature on the `handoff-receive` (more on this later in the document).

Alisha so far has added to her implementation support to initiate handoffs when she's the Gifter, but she currently hasn't implemented handoffs when she's the receiver, it's important to support all aspects of handoffs so she begins adding support for creating the `desc:handoff-receive` too. Alisha adds both counters for the `handoff-count` and then adds to her implementation of receiving both `op:deliver` and `op:deliver-only` to peform handoffs when a message arrives with a signed `handoff-give` within it. When this exists Alisha replaces the reference she gives to her local objects with a promise that her peer will fulfill once it has performed her role in the handoff. Alisha then checks if her peer has a session with the peer specified in the `exporter-location` location on the `desc:handoff-give`, if so she just uses that when sending her `desc:handoff-receive`, otherwise she creates a connection and new session with that peer. Alisha then adds code to generate the `handoff-receive`, making sure to remember to implement her `handoff-count` counter and signs it sending it to the exporter's bootstrap object:

```
<op:deliver <desc:export 0> ['withdraw-gift <desc:sig-envelope <desc:handoff-receive ...> <signature....>> #f <desc:import-object 1>
```

In this case we're using the `op:deliver` operation as if this succeeds the exporter's bootstrap object will reply with the reference left by the gifter (in Ben's case a reference to the robot gallery).

Alisha finally adds support so that when the promise created in her `op:deliver` message resolves (either by fulfilling or breaking), it fulfills the local promise that her instance created when receiving the signed `handoff-give`.

#### Checking the certificates and fulfilling the handoff

When the exporter receives the signed `desc:handoff-receive` from the exporter, it must check both certificates before responding to ensure everything is correct. Lets remind ourselves of how the signed `desc:handoff-receive` looks all together, in the below example assume A is the gifter, B is the receiver and C the exporter:

```
(desc:sig-envelope
  (desc:handoff-receive
    <BtoC-session>                  ; receiving-session: Name of session in B ↔ C
    <B-key-of-BtoC>                 ; receiving-side: The B’s public key in B ↔ C
    4                               ; handoff-count: Integer to prevent replay attacks
    (desc:sig-envelope              ; signed-give: the gifter's signed handoff give
      (desc:handoff-give
        <B-key-of-AtoB>             ; recipient-key: B’s public key in A ↔ B
        ”ocapn://machine-c.foo”     ; exporter-location: Machine address to C
        AtoC-session                ; session: Session ID for A ↔ C session
        A-key-of-AtoC               ; gifter-side: A’s public key in A ↔ C
        5)                          ; gift-id: key in A ↔ C’s gift table
    <signature-by-A-key-of-AtoC>))  ; Signature A made using their key in A ↔ C
  <signature-by-B-key-of-AtoB>)     ; Signature B has made using their A ↔ B key
```

Alisha adds support for this to her bootstrap object so that she can fulfill the role of exporter in Third Party Handoffs. Lets look at each thing the exporter needs to check one by one:

#### Do we have an open session with the gifter?

Handoffs work by having a reference deposited on a per-session gift table and then collected by another peer. Handoffs only work when both the session between the gifter and exporter and receiver and exporter are still in existance. If the gifter has aborted the session with the exporter after initiating the handoff, the handoff cannot succeed as the exporter should not have the gift table, nor the relevent handoff keys to be able to verify and perform the handoff successfully.

Since each session has a session ID which is both sides names sorted and hashed (exact algorithm in the CapTP specification), we can use the `session` on the `desc:handoff-give` to check if we have a session and fetch the gift table and handoff keys needed to verify the certificate and upon successful verification extract the gift for the receiver.

#### Did the gifter actually make the `desc:handoff-give`

The `desc:handoff-give` using the private key that the gifter is using within the exporter <-> gifter session. This allows the exporter to verify that the other peer within the session it looked up in the above step actually did create and sign this `desc:handoff-give` certificate. No other peer has access to that key so only the gifter (the other peer in the above session) could have produced this certificate. With this verified the data in it can be trusted to be made by the gifter allowing us to trust:

- The public key specified in `recipient-key` is the one used within the gifter's session with the receiver.
- That the gift ID is the one the gifter deposited a gift at.

### Is the receiver who the one who made the `desc:handoff-receive`

For handoffs to remain secure it's important that only the receiver that the gifter intended is able to use the handoff capability. Since handoffs must remain secure if the messages sent are published, the `desc:handoff-give` certificate must only be usable by the receiver the gifter intended. CapTP accomplishes this by having the gifter provide the key in the `desc:handoff-give` that the receiver uses in the gifter <-> receiver session. After the above step, the exporter has verified that the gifter has created the `desc:handoff-give` and thus this key can be trusted as it can't have been modified or created by a different peer.

The key is then extracted and the signature which wraps the `desc:handoff-receive` can be verified that it was made by the private key which corresponds with the public key provided.

### Is this a reply attack?

Finally since the exporter has been able to verify the `desc:handoff-receive` is valid we can trust that the `handoff-count` has not been modified. The exporter extracts that value and checks it is greater than the handoff-count presented in the last handoff, or zero (in the case this is the first `desc:handoff-receive` sent). If an attacker had seen this `desc:handoff-receive` they couldn't replay it as is as the handoff-count would be too low and if they changed it the above signature check would fail, preventing any sort of reply attack.

### Fulfilling the handoff

![](./handoffs-3party5.webm)

Many checks have been made and now the exporter can be sure of:

- The `desc:handoff-give` was created by gifter and the session between the exporter and gifter has been found.
- The `desc:handoff-receive` was created by the receiver the gifter intended
- The handoff is not being replayed.

If any of the checks above were to fail the handoff must be aborted, however upon success the exporter can now check to see if the gift by the gift ID specified in the `desc:handoff-give` exists in the gift table between the gifter and exporter. If the gift is there it can be extracted and the promise created by the receiver in sending the `op:deliver` with the `desc:handoff-receive` can be fulfilled with the reference deposited. Finally the gift can be removed from the gift table as handoffs cannot be used multiple times.

Ordering however does not matter and if the gift isn't there when the receiver asks for it, the handoff should not fail. The exporter instead should setup a mechanism to be notified when the gift is deposited and fulfill the promise then.

Alisha implements the role of the exporter in her handoff implementation which adds the `withdraw-gift` to her bootstrap object which accepts a signed `desc:handoff-receive` as an argument. Alisha also creates a new table in the bootstrap object that she uses to internally keep track of promise resolvers for gifts which are deposited after the `desc:handoff-receive` has been received. Alisha then performs the verification above checking both certificates and ensuring no reply attack is happening. Alisha being satisfied the handoff is valid looks to see if the gift is in the gift table in for the gifter session and if so fulfills the promise with that reference and drops it from the gift table. If it's not there she sets up a local promise which she responds to the receiver with and then adds the resolver for that local promise to the gift deposit notification table. Finally she adds to the `deposit-gift` method implementation support for checking this gift deposit notification table to ensure if a gift is deposited and there's a resolver wanting to be notified that the resolver fulfills the promise with gift reference instead of depositing it in the gift table.

### Alisha's handoff of Carol's gallery to Ben

Going back to the initial story of Alisha who's wanting to give a reference to Carol's gallery to Ben, each on their own peer, let's look at how this handoff works in practice. Alisha's peer initially creates a gift ID and sends a messsage to Carol's bootstrap object to deposit the gift:

```
;; Assuming the robot gallery object is exported by Carol at position 4.
<op:deliver-only (desc:export 0) ['deposit-gift 5 (desc:export 4)]
```

Alisha then sends a message to Ben on peer B, the message is following the CapTP convention of message invocation so it's a list with the first item being a symbol to describe the method and then the rest being the arguments, in this case this would be the method "send-robot-photos" and the argument being the reference to carol's robot gallery. Of course, this reference is on Peer C (Carol's peer) so instead of the normal import/export reference, it's the signed `(desc:handoff-give`):

```
<op:deliver-only (desc:export 5)
                 ['send-robot-photos
                  (desc:sig-envelope
                    (desc:handoff-give
                      <Ben's public key for his session with Alisha>
                      (ocapn-peer "tcenolezzq7vleywviuvwl74dh2nhs3nf7lun5zuhtjpwhjed5ojw6qd" 'onion #f)
                      <ID of the session Alisha and Carol's peer have>
                      <Alisha's public key in her session with Carol>
                      5)
                    <signature Alisha made with her private key in the session with Carol's Peer>)]>
```

Ben's Peer then gets the `op:deliver-only` message and then looks through the arguments and sees a signed `desc:handoff-give` and so must perform a handoff and create a certificate. Ben's implementation replaces this handoff reference with a promise and delivers it to the object and then begins the handoff. Ben's peer checks and sees he doesn't have any open session to the peer specified so opens a new connection to `(ocapn-peer "tcenolezzq7vleywviuvwl74dh2nhs3nf7lun5zuhtjpwhjed5ojw6qd" 'onion #f)`. Once his instance has initiated the connection by performing the steps outlined in step 0, bootstrapping a connection, he's able to use this session to send his handoff certificate. Ben's peer creates the `desc:handoff-receive` and signs it using the key from his session with Alisha's peer. Ben's peer then sends this signed certificate to the bootstrap object on Carol's peer in the session he's just made:

```
<op:deliver (desc:export 0)
            ['withdraw-gift
             (desc:sig-envelope
              (desc:handoff-receive
                <ID of the newely created session Ben has with Carol>
                0
                (desc:sig-envelope
                  (desc:handoff-give
                    <Ben's public key for his session with Alisha>
                    (ocapn-peer "tcenolezzq7vleywviuvwl74dh2nhs3nf7lun5zuhtjpwhjed5ojw6qd" 'onion #f)
                    <ID of the session Alisha and Carol's peer have>
                    <Alisha's public key in her session with Carol>
                    5)
                  <signature Alisha made with her private key in the session with Carol's Peer>)))
            ]
           #f
           <desc:import-object 1>>
```
/If Ben had had a connection to Carol's Peer, Peer C, his Peer would just have used that instead of creating a new one/

Carol's Peer receives this message and delivers it to the bootstrap object which performs the following steps:

1. Looks up the session specified on the `desc:handoff-give`, it's Carol's session with Alisha, so Alisha is the gifter here.
2. Using the Alisha's public key in the session Carol and Alisha have, Carol is able to check the signature on the `desc:handoff-give`.
3. Carol then looks at Ben's public key that Alisha left for her on the `desc:handoff-give`
4. Carol uses the key from step 3 to check the signature of the `desc:handoff-receive` to check it really is Ben who made the `desc:handoff-receive` and that it's not been tempered with.
5. Finally, Carol looks at the `handoff-count` on the `desc:handoff-receive` which is 0. She checks it with the counter she has and sees this is the first handoff receive she's got from Ben, so that checks out too.

Since all those checks pass, Carol can know that the handoff is valid and she should provide the reference (gift) Alisha has or will be leaving with her for Ben. Carol increments the counter she has for how many `desc:handoff-receive`s she's got for Ben's session so it can't be replayed and then checks the gift table she has for her and Alisha's session. In this case Alisha's gift has already been deposited and so Carol is able to just take that reference and provide it to Ben, which she exports at position 1:

```
;; Fulfilling the promise created in Ben's `op:deliver`
<op:deliver-only (desc:export 1) ['fulfill (desc:import-object 1)]>
```

Finally Carol is able to remove the reference from the gift table as the handoff is complete.

# Appendix
## Appendix A: Vats

/NOTE: whether or not continuing to include this section is worthwhile is subject to further consideration within the OCapN specification group./

This resembles the pattern of "communicating event loops" which contain objects, and in object capability security terminology, such event loops are generally called "vats".

A peer may contain one or more vats, but if more than one vat is contained on a peer, this detail is not exposed to the OCapN network, it is an internal detail of that peer.

```
;;;   .----------------------------------.         .-------------------.
;;;   |              Peer 1              |         |       Peer 2      |
;;;   |              ======              |         |       ======      |
;;;   |                                  |         |                   |
;;;   | .--------------.  .---------.   .-.       .-.                  |
;;;   | |    Vat A     |  |  Vat B  |   |  \______|  \_   .----------. |
;;;   | |  .---.       |  |   .-.   | .-|  /      |  / |  |   Vat C  | |
;;;   | | (Alice)----------->(Bob)----' '-'       '-'  |  |  .---.   | |
;;;   | |  '---'       |  |   '-'   |    |         |   '--->(Carol)  | |
;;;   | |      \       |  '----^----'    |         |      |  '---'   | |
;;;   | |       V      |       |         |         |      |          | |
;;;   | |      .----.  |       |        .-.       .-.     |  .----.  | |
;;;   | |     (Alfred) |       '-------/  |______/  |____---(Carlos) | |
;;;   | |      '----'  |               \  |      \  |     |  '----'  | |
;;;   | |              |                '-'       '-'     '----------' |
;;;   | '--------------'                 |         |                   |
;;;   |                                  |         |                   |
;;;   '----------------------------------'         '-------------------'
```

```
;;;  - Zooming in the farthest, we are looking at the "object layer"...
;;;    Alice has a reference to Alfred and Bob, Bob has a reference to Carol,
;;;    Carlos has a reference to Bob.  Reference possession is directional;
;;;    even though Alice has a reference to Bob, Bob does not have a
;;;    reference to Alice.
;;;
;;;  - One layer up is the "vat layer"... here we can see that Alice and
;;;    Alfred are both objects in Vat A, Bob is an object in Vat B, and
;;;    Carol and Carlos are objects in Vat C.
;;;
;;;  - Zooming out the farthest is the "peer/network level".
;;;    There are two peers (Peer 1 and Peer 2) connected over a
;;;    Goblins CapTP network.  The stubby shapes on the borders between the
;;;    peers represent the directions of references Peer 1 has to
;;;    objects in Peer 2 (at the top) and references Peer 2 has to
;;;    Peer 1.  Both peers in this diagram are cooperating to preserve
;;;    that Bob has access to Carol but that Carol does not have access to
;;;    Bob, and that Carlos has access to Bob but Bob does not have access
;;;    to Carlos.  (However there is no strict guarantee from either
;;;    peer's perspective that this is the case... generally it's in
;;;    everyone's best interests to take a "principle of least authority"
;;;    approach though so usually it is.)
```

The OCapN specifications leaves what happens after messages are delivered to the implementations and offers no opinions on what system might exist. OCapN has its roots in systems which implement an event loop and object heap called a *vat*. The vat has objects spawned within it and messages sent to these objects are queued up in a FIFO, the messages a delivered one at a time to the objects. Vats are transactional and if an error were to occur during message delivery, the transaction would be aborted leaving the vat in the prior state.

Often machines (virtual or otherwise) have multiple vats running on them, some implementations have their own message delivery between vats and has CapTP for messaging between machines, while others have CapTP boundaries between all vats, including those on the same machine.

None of this is required to implement OCapN, however the notion of a vat might serve as a good model to implement in conjunction to OCapN.
