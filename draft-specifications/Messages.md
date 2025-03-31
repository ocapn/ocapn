This is a formatting used for the Syrup-encoded messages and data structures used in OCapN.

This document is divided into three sections:

1. Descriptors
2. Data Partials
3. Operations

Using abstract notation with named arguments whose types are defined below the argument ordering.

Note: "CapTPType" is the type of all CapTP types ("Descriptors"?).

## Descriptors


### DescImportObject

`<desc:import-object position>`

position: int


### DescImportPromise

`<desc:import-promise position>`

position: int


### DescExport

`<desc:export position>`

position: int


### DescAnswer

`<desc:answer position>`

position: int


### DescSigEnvelope

`<desc:sig-envelope data signature>`

data: CapTPType

signature: Signature


### DescHandoffGive

`<desc:handoff-give receiver-key exporter-location session gifter-side gift-id>`

receiver-key: CapTPPublicKey

exporter-location: OCapNNode

session: bytes

gifter-side: CapTPPublicKey

gift-id: bytes


### DescHandoffReceive

`<desc:handoff-receive receiving-session receiving-side handoff-count signed-give>`

receiving-session: bytes

receiving-side: bytes

handoff-count: int

signed-give: DescSigEnvelope


## Data Partials

### CapTPPublicKey

`<public-key type curve flags q>`

type: Symbol ("ecc")

curve: Symbol ("Ed25519")

flags: Symbol ("eddsa")

q: bytes

### Signature

`<sig-val type r s>`

type: Symbol ("eddsa")

r: List `[r RValue]`
  - r: Symbol ("r")
  - rValue: bytes

s: List `[s SValue]`
  - s: Symbol ("s")
  - sValue: bytes


## Operations


### OpStartSession

`<op:start-session captp-version session-pubkey location location-sig>`

captp-version: string

session-pubkey: CapTPPublicKey

location: OCapNNode

location-sig: Signature


### OpListen

`<op:listen to-desc resolve-me-desc wants-partial>`

to-desc: DescExport

resolve-me-desc: DescImportObject | DescImportPromise

wants-partial: bool


### OpDeliverOnly

`<op:deliver-only to args>`

to: DescExport

args: list


### OpDeliver

`<op:deliver to args answer-position resolve-me-desc>`

to: DescExport

args: list

answer-position: int

resolve-me-desc: DescImportObject | DescImportPromise


### OpAbort

`<op:abort reason>`

reason: string


### OpGcExport

`<op:gc-export export-position wire-delta>`

export-position: int

wire-delta: int


### OpGcAnswer

`<op:gc-answer answer-position>`

answer-position: int


## OCapN URI


### OCapNNode

`<ocapn-node transport address hints>`

transport: Symbol

address: string

hints: bool


### OCapNSturdyref

`<ocapn-sturdyref node swiss-num>`

node: OCapNNode

swiss-num: string




