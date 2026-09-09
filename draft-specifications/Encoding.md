# OCapN Encoding

## Tags

Every type in this encoding format is represented by a tag byte potentially followed by some content as described in [details](#details).

| Tag (Hex) | Type |
| --- | --- |
| 00  | Null |
| 01  | Undefined |
| 02  | Boolean false |
| 03  | Boolean true |
| 04  | Float64 |
| 05  | positive Integer (1 bytes) |
| 06  | positive Integer (2 bytes) |
| 07  | positive Integer (4 bytes) |
| 08  | positive Integer (8 bytes) |
| 09  | positive Integer (>8 bytes) |
| 0A  | negative Integer (1 bytes) |
| 0B  | negative Integer (2 bytes) |
| 0C  | negative Integer (4 bytes) |
| 0D  | negative Integer (8 bytes) |
| 0E  | negative Integer (>8 bytes) |
| 0F  | RESERVED |

| Tag (Hex) | Type |
| --- | --- |
| 10  | ByteArray |
| 11  | String |
| 12  | Symbol |
| 13  | Tagged |
| 14  | List |
| 15  | Set |
| 16  | Map |
| 17  | Peer Locator |
| 18  | sturdyref locator |
| 19  | Error |
| 1A-1F | RESERVED |

| Tag (Hex) | Type |
| --- | --- |
| 20  | desc:answer |
| 21  | desc:export |
| 22  | desc:import-object |
| 23  | desc:import-promise |
| 24  | desc:sig-envelope |
| 25  | desc:handoff-give |
| 26  | desc:handoff-receive |
| 27-2F | RESERVED |

| Tag (Hex) | Type |
| --- | --- |
| 30  | op:start-session |
| 31  | op:abort |
| 32  | op:deliver |
| 33  | op:listen |
| 34  | op:gc-exports |
| 35  | op:gc-answers |
| 36  | op:get |
| 37  | op:index |
| 38  | op:untag |
| 39  | op:flush |
| 3A-FF | RESERVED |

## Notations

Two representations are displayed in order:

- Text (for things such as spec writing)
- Binary

A || B denotes binary concatenation of A and B  
\<\<something>> denotes an encoded representation of something

## Varint format
In various places this spec uses variable-length integers (varints) to denote length or size of data being transmitted.

Varints that can fit in 7 bits are encoded as is with a leading 0 bit.

Varints longer than 7 bits are encoded as the minimum number of bytes required to represent the integer,  
preceded by a leading byte with value `0x80 | numBytes`.

For example, the varint representation of the integer 255 would be 0x81FF.

(Note that this is not how Integer data is encoded. See [Integer](#integer) for more.)

## Details
### Null
`null`

0x00

### Undefined
`undefined`

0x01

### False
`false`

0x02

### True
`true`

0x03

### Float64

`123.0` <- decimal important to differentiate from Integer

0x04 || 8 IEEE 754 encoded bytes

### Integer

`42`

Integers are represented using a different tag depending on the minimum number of bytes required to encode the absolute value of the integer. For example, the integer 4 would be encoded as 0x0504 while the integer 256 would be encoded as 0x060100.

Negative integers are represented by picking the appropriate negative tag byte in the range 0x0A to 0x0E. Following the tag, values are transmitted as absolute values (-n). Negative 0 is invalid.

#### Positive integer (1 Byte)
0x05 || byte

#### Positive integer (2 Bytes)
0x06 || bytes

#### Positive integer (4 Bytes)
0x07 || bytes

#### Positive integer (8 Bytes)
0x08 || bytes

#### Positive integer (BigInt)
0x09 || [varint](#varint-format) num bytes || bytes

#### Negative integer (1 Byte)
0x0A || byte

#### Negative integer (2 Bytes)
0x0B || bytes

#### Negative integer (4 Bytes)
0x0C || bytes

#### Negative integer (8 Bytes)
0x0D || bytes

#### Negative integer (BigInt)
0x0E || [varint](#varint-format) num bytes || bytes

### ByteArray, String, Symbol
tag || [varint](#varint-format) num bytes || bytes

For String and Symbol, bytes is the UTF-8 encoding of the String and Symbol name, respectively.

| Text | Binary |
| --- | --- |
| 0xABC123 | 0x10 \|\| 0x03 \|\| 0xAB_C1_23 |
| "my-string" | 0x11 \|\| 0x09 \|\| bytes |
| 'my-symbol | 0x12 \|\| 0x09 \|\| bytes |

### Tagged
`<name value>`  

0x13 || \<\<String name>> || \<\<value>>

example: `<foo true>` is 0x13 || 0x11_03_666F6F || 0x03

//TODO: Symbol name?

### List
`[e1, e2, e3]`  

0x14 || [varint](#varint-format) N elements || \<\<e1>> || \<\<e2>> || ... || \<\<eN>>

example: `[true, false]` is 0x14 || 0x02 || 0x03 || 0x02

### Set
`{e1, e2, e3}`  

0x15 || [varint](#varint-format) N elements || \<\<e1>> || \<\<e2>> || ... || \<\<eN>>

example: `{false, true}` is 0x15 || 0x02 || 0x02 || 0x03

All elements must be unique and written in order sorted lexicographically by their representations.

### Map
`{k1: v1, k2: v2, ... kN: vN}`  

0x16 || [varint](#varint-format) N elements || \<\<k1>> || \<\<v1>> || \<\<k2>> || \<\<v2>> || ... || \<\<kN>> || \<\<vN>>

All keys must be unique. Key/value pairs MUST be written in order of keys sorted lexicographically by their representations.

### PeerLocator
`<ocapn-peer transport designator hints>`  

0x17 || \<\<Symbol transport>> || \<\<String designator>> || \<\<Map<String, String> hints>>

TODO: hints false if none or just empty map? null would be better than false for Dart

### SturdyRef
`<ocapn-sturdyref peer swiss-num>`  

0x18 || \<\<PeerLocator peer>> || \<\<ByteData swiss-num>>

### Error
TBD  

tag 0x19

### OCapN Descriptors
#### desc:answer
`<desc:answer position>`  

0x20 || \<\<int position>>

#### desc:export
`<desc:export position>`  

0x21 || \<\<int position>>

#### desc:import-object
`<desc:import-object position>`  

0x22 || \<\<int position>>

#### desc:import-promise
`<desc:import-promise position>`  

0x23 || \<\<int position>>

#### desc:sig-envelope
`<desc:sig-envelope signed signature>`  

0x24 || \<\<signed>> || \<\<ByteArray signature>>

#### desc:handoff-give
`<desc:handoff-give receiver-key exporter-location session-id gifter-side gift-id>`  

0x25 || \<\<receiver-key>> || \<\<PeerLocator exporter-location>> || \<\<ByteArray session-id>> || \<\<ByteArray gifter-side>> || \<\<ByteArray gift-id>>

#### desc:handoff-receive
`<desc:handoff-receive receiving-session receiving-side handoff-count signed-give>`  

0x26 || \<\<ByteArray receiving-session>> || \<\<ByteArray receiving-side>> || \<\<positive int handoff-count>> || \<\<desc:sig-envelope signed-give>>

### OCapN Operators
#### op:start-session
`<op:start-session captp-version crypto-version session-pubkey acceptable-location acceptable-location-sig>`  

0x30 || \<\<String captp-version>> || \<\<String crypto-version>> || \<\<ByteArray session-pubkey>> || \<\<PeerLocator acceptable-location>> || \<\<desc:sig-envelope acceptable-location-sig>>

#### op:abort
`<op:abort reason>`  

0x31 || \<\<String reason>>

#### op:deliver
`<op:deliver to-desc args answer-pos>`  

0x32 || \<\<to-desc>> || \<\<List args>> || \<\<answer-pos>>

to-desc is either a desc:export or a desc:answer  

answer-pos is either a non-negative integer or false

#### op:listen
`<op:listen to-desc resolver-desc listen-mode>`  

0x33 || \<\<to-desc>> || \<\<resolver-desc>> || \<\<int listen-mode>>

to-desc is either a desc:export or a desc:answer  

resolver-desc is either a desc:import-object or desc:import-promise

#### op:gc-exports
`<op:gc-exports export-pos-list wire-delta-list>`  

0x34 || \<\<List export-pos-list>> || \<\<List wire-delta-list>>

#### op:gc-answers
`<op:gc-answers answer-pos-list>`  

0x35 || \<\<List answer-pos-list>>

#### op:get
`<op:get receiver-desc field-name new-answer-pos>`  

0x36 || \<\<receiver-desc>> || \<\<String field-name>> || \<\<int new-answer-pos>>

receiver-desc is either a desc:export or desc:answer

#### op:index
`<op:index receiver-desc index new-answer-pos>`  

0x37 || \<\<receiver-desc>> || \<\<int index>> || \<\<int new-answer-pos>>

receiver-desc is either a desc:export or desc:answer

#### op:untag
`<op:untag receiver-desc tag new-answer-pos>`  

0x38 || \<\<receiver-desc>> || \<\<String tag>> || \<\<int new-answer-pos>>

receiver-desc is either a desc:export or desc:answer

#### op:flush
`<op:flush to-desc confirm-desc>`  

0x39 || \<\<desc:export to-desc>> || \<\<confirm-desc>>

confirm-desc is either a desc:import-object or desc:import-promise
