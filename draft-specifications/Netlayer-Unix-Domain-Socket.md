# Unix domain socket netlayer documentation

The Unix domain socket netlayer uses anonymous domain sockets to allow peers to
communicate with one another. These sockets provide a fast and convenient
mechanism for processes on the same machine to communicate with one another. The
netlayer was designed from the point of view that the netlayer itself does not
need any file system access, because of this netlayers need one or more
introduction servers which facilitating new connections between peers, but do
not relay the traffic once two peers have been introduced. Connections between
two peers requires them to share an introduction server. Both the netlayers and
the introduction servers have identity via key pairs.

The communication between the netlayer and the introduction occurs through
several operations expressed in syrup. These operations, like CapTP, are defined
as structs.

## Operations

### uds:register

```
<uds:register peer-location.      ; OCapN Locator of peer
              client-challenge>   ; ByteArray of challenge from peer to introduction server
```

This operation is sent by a netlayer to the introduction server after
connecting. It contains the OCapN Locator (location) of the peer itself and a
challenge for the server to sign. The challenge must be some strong randomly
generated noise that can be used to have the introduction server proove its
identity to the netlayer.

### uds:server-response

```
<uds:server-response pubkey                      ; List representing public key in the same format as CapTP
                     server-challenge            ; ByteArray of challenge from introduction server.
                     client-challenge-response>  ; uds:signature value
```

Once the introduction server has read the `uds:register` operation, it MUST
response with a `uds:server-response`. The contains the following values:

- `pubkey`: The public key of the introduction server which is formatted
  in the same way as formatted in CapTP. That is following this format:
  
  https://github.com/ocapn/ocapn/blob/main/draft-specifications/CapTP%20Specification.md#public-key
  
- `server-challenge`: This is like the `client-challenge` a ByteArray containing
  some strong randomly generated noise which the netlayer will sign to prove its
  identity.
  
- `client-challenge-response`: This is `uds:signature` struct. Please see its
  definition below.

When the netlayer receives the `uds:server-response` message, it MUST check
the signature of the client-challenge that it sent against the one provided in
`client-challenge-response`. The signature MUST be valid for the provided
server `pubkey`. If the signature is not valid for the `pubkey`, the connection
MUST be closed. Provided the signature is valid, the netlayer MUST then
response with a `uds:signature` signing the `server-challenge` provided with its
designator key.

### uds:signature

```
<uds:signature payload     ; ByteArray of data being signed
               signature>  ; List representing signature in the same format as CapTP
```

This is used both within `uds:server-response` and on it's own by the netlayer
when signing the `server-challenge`. It includes the following values:

- `payload`: The data being signed.
- `signature`: A cryptographic signature formatted as a List according to the
  way CapTP formats signatures. i.e.
  
  https://github.com/ocapn/ocapn/blob/main/draft-specifications/CapTP%20Specification.md#signature

When the server receives this in response to its `uds:server-response` message,
it MUST check that the signature is valid for the key encoded in the OCapN
peer locator designator. If the signature is valid for the key, the server
can then finish any setup and provide introductions upon request both to and from
this netlayer. If the signature is invalid the connection MUST be closed and
no introductions to the netlayer MUST occur.

### uds:new-connection

```
<uds:new-connection from  ; OCapN Locator of sender's peer Locator 
                    to>   ; OCapN Locator of receipient's peer Locator
```

This is used by the netlayer to ask the introduction to perform an introduction
to another peer. The operation consists of:

- `from`: OCapN Locator of the peer opening the connection.
- `to`: OCapN Locator of the peer the connection is being opened to.

Once this message has been written to the socket to the introduction server, the
next message MUST be `SCM_RIGHTS` message with a file descriptor to a Unix domain
socket that the sender has created. The introduction server will then send this
exact same `uds:new-connection` message to the peer address in `to`, and
followed by the SCM_RIGHTS message with the socket it read.

SCM_RIGHTS messages have several parts, one of which is a body, which is not
used or important to the netlayer, so the data contained within it is ignored.
The file descriptor itself is placed within the ancillary data in the socket
control message, these and sent with `sendmsg` and recieved with `recvmsg` For
further information on `SCM_RIGHTS`, see:

https://man7.org/linux/man-pages/man7/unix.7.html

## Peer Locator

The peer locator of the Unix domain socket has as follows:

- *designator*: A String which contains the base32 encoded public key of the
  Peer.
- *transport*: The symbol `unix-domain-socket`
- *hints*: A struct where the keys are the identities of the introduction
  servers which the server is connected to and can be used to gain a connection
  to the peer. The keys are base32 encoded with the value of the struct keys not
  being important.
