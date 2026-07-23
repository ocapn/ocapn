/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const Passable = $root.Passable = (() => {

    /**
     * Properties of a Passable.
     * @exports IPassable
     * @interface IPassable
     * @property {INull|null} ["null"] Passable null
     * @property {IUndefined|null} [undefined] Passable undefined
     * @property {boolean|null} [bool] Passable bool
     * @property {number|null} [number] Passable number
     * @property {string|null} [string] Passable string
     * @property {Uint8Array|null} [bigint] Passable bigint
     * @property {IRemotable|null} [remotable] Passable remotable
     * @property {IError|null} [error] Passable error
     * @property {IPromise|null} [promise] Passable promise
     * @property {string|null} [symbol] Passable symbol
     * @property {ICopyArray|null} [copyArray] Passable copyArray
     * @property {ICopyRecord|null} [copyRecord] Passable copyRecord
     * @property {ITagged|null} [tagged] Passable tagged
     */

    /**
     * Constructs a new Passable.
     * @exports Passable
     * @classdesc Represents a Passable.
     * @implements IPassable
     * @constructor
     * @param {IPassable=} [properties] Properties to set
     */
    function Passable(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Passable null.
     * @member {INull|null|undefined} null
     * @memberof Passable
     * @instance
     */
    Passable.prototype["null"] = null;

    /**
     * Passable undefined.
     * @member {IUndefined|null|undefined} undefined
     * @memberof Passable
     * @instance
     */
    Passable.prototype.undefined = null;

    /**
     * Passable bool.
     * @member {boolean|null|undefined} bool
     * @memberof Passable
     * @instance
     */
    Passable.prototype.bool = null;

    /**
     * Passable number.
     * @member {number|null|undefined} number
     * @memberof Passable
     * @instance
     */
    Passable.prototype.number = null;

    /**
     * Passable string.
     * @member {string|null|undefined} string
     * @memberof Passable
     * @instance
     */
    Passable.prototype.string = null;

    /**
     * Passable bigint.
     * @member {Uint8Array|null|undefined} bigint
     * @memberof Passable
     * @instance
     */
    Passable.prototype.bigint = null;

    /**
     * Passable remotable.
     * @member {IRemotable|null|undefined} remotable
     * @memberof Passable
     * @instance
     */
    Passable.prototype.remotable = null;

    /**
     * Passable error.
     * @member {IError|null|undefined} error
     * @memberof Passable
     * @instance
     */
    Passable.prototype.error = null;

    /**
     * Passable promise.
     * @member {IPromise|null|undefined} promise
     * @memberof Passable
     * @instance
     */
    Passable.prototype.promise = null;

    /**
     * Passable symbol.
     * @member {string|null|undefined} symbol
     * @memberof Passable
     * @instance
     */
    Passable.prototype.symbol = null;

    /**
     * Passable copyArray.
     * @member {ICopyArray|null|undefined} copyArray
     * @memberof Passable
     * @instance
     */
    Passable.prototype.copyArray = null;

    /**
     * Passable copyRecord.
     * @member {ICopyRecord|null|undefined} copyRecord
     * @memberof Passable
     * @instance
     */
    Passable.prototype.copyRecord = null;

    /**
     * Passable tagged.
     * @member {ITagged|null|undefined} tagged
     * @memberof Passable
     * @instance
     */
    Passable.prototype.tagged = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * Passable it.
     * @member {"null"|"undefined"|"bool"|"number"|"string"|"bigint"|"remotable"|"error"|"promise"|"symbol"|"copyArray"|"copyRecord"|"tagged"|undefined} it
     * @memberof Passable
     * @instance
     */
    Object.defineProperty(Passable.prototype, "it", {
        get: $util.oneOfGetter($oneOfFields = ["null", "undefined", "bool", "number", "string", "bigint", "remotable", "error", "promise", "symbol", "copyArray", "copyRecord", "tagged"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Encodes the specified Passable message. Does not implicitly {@link Passable.verify|verify} messages.
     * @function encode
     * @memberof Passable
     * @static
     * @param {IPassable} message Passable message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Passable.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message["null"] != null && Object.hasOwnProperty.call(message, "null"))
            $root.Null.encode(message["null"], writer.uint32(/* id 0, wireType 2 =*/2).fork()).ldelim();
        if (message.undefined != null && Object.hasOwnProperty.call(message, "undefined"))
            $root.Undefined.encode(message.undefined, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.bool != null && Object.hasOwnProperty.call(message, "bool"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.bool);
        if (message.number != null && Object.hasOwnProperty.call(message, "number"))
            writer.uint32(/* id 3, wireType 1 =*/25).double(message.number);
        if (message.bigint != null && Object.hasOwnProperty.call(message, "bigint"))
            writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.bigint);
        if (message.string != null && Object.hasOwnProperty.call(message, "string"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.string);
        if (message.symbol != null && Object.hasOwnProperty.call(message, "symbol"))
            writer.uint32(/* id 8, wireType 2 =*/66).string(message.symbol);
        if (message.copyArray != null && Object.hasOwnProperty.call(message, "copyArray"))
            $root.CopyArray.encode(message.copyArray, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
        if (message.copyRecord != null && Object.hasOwnProperty.call(message, "copyRecord"))
            $root.CopyRecord.encode(message.copyRecord, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
        if (message.tagged != null && Object.hasOwnProperty.call(message, "tagged"))
            $root.Tagged.encode(message.tagged, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
        if (message.remotable != null && Object.hasOwnProperty.call(message, "remotable"))
            $root.Remotable.encode(message.remotable, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
        if (message.error != null && Object.hasOwnProperty.call(message, "error"))
            $root.Error.encode(message.error, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
        if (message.promise != null && Object.hasOwnProperty.call(message, "promise"))
            $root.Promise.encode(message.promise, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Passable message, length delimited. Does not implicitly {@link Passable.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Passable
     * @static
     * @param {IPassable} message Passable message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Passable.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Passable message from the specified reader or buffer.
     * @function decode
     * @memberof Passable
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Passable} Passable
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Passable.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Passable();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 0: {
                    message["null"] = $root.Null.decode(reader, reader.uint32());
                    break;
                }
            case 1: {
                    message.undefined = $root.Undefined.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.bool = reader.bool();
                    break;
                }
            case 3: {
                    message.number = reader.double();
                    break;
                }
            case 6: {
                    message.string = reader.string();
                    break;
                }
            case 4: {
                    message.bigint = reader.bytes();
                    break;
                }
            case 13: {
                    message.remotable = $root.Remotable.decode(reader, reader.uint32());
                    break;
                }
            case 14: {
                    message.error = $root.Error.decode(reader, reader.uint32());
                    break;
                }
            case 15: {
                    message.promise = $root.Promise.decode(reader, reader.uint32());
                    break;
                }
            case 8: {
                    message.symbol = reader.string();
                    break;
                }
            case 9: {
                    message.copyArray = $root.CopyArray.decode(reader, reader.uint32());
                    break;
                }
            case 10: {
                    message.copyRecord = $root.CopyRecord.decode(reader, reader.uint32());
                    break;
                }
            case 11: {
                    message.tagged = $root.Tagged.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Passable message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Passable
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Passable} Passable
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Passable.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Passable message.
     * @function verify
     * @memberof Passable
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Passable.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message["null"] != null && message.hasOwnProperty("null")) {
            properties.it = 1;
            {
                let error = $root.Null.verify(message["null"]);
                if (error)
                    return "null." + error;
            }
        }
        if (message.undefined != null && message.hasOwnProperty("undefined")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            {
                let error = $root.Undefined.verify(message.undefined);
                if (error)
                    return "undefined." + error;
            }
        }
        if (message.bool != null && message.hasOwnProperty("bool")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            if (typeof message.bool !== "boolean")
                return "bool: boolean expected";
        }
        if (message.number != null && message.hasOwnProperty("number")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            if (typeof message.number !== "number")
                return "number: number expected";
        }
        if (message.string != null && message.hasOwnProperty("string")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            if (!$util.isString(message.string))
                return "string: string expected";
        }
        if (message.bigint != null && message.hasOwnProperty("bigint")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            if (!(message.bigint && typeof message.bigint.length === "number" || $util.isString(message.bigint)))
                return "bigint: buffer expected";
        }
        if (message.remotable != null && message.hasOwnProperty("remotable")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            {
                let error = $root.Remotable.verify(message.remotable);
                if (error)
                    return "remotable." + error;
            }
        }
        if (message.error != null && message.hasOwnProperty("error")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            {
                let error = $root.Error.verify(message.error);
                if (error)
                    return "error." + error;
            }
        }
        if (message.promise != null && message.hasOwnProperty("promise")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            {
                let error = $root.Promise.verify(message.promise);
                if (error)
                    return "promise." + error;
            }
        }
        if (message.symbol != null && message.hasOwnProperty("symbol")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            if (!$util.isString(message.symbol))
                return "symbol: string expected";
        }
        if (message.copyArray != null && message.hasOwnProperty("copyArray")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            {
                let error = $root.CopyArray.verify(message.copyArray);
                if (error)
                    return "copyArray." + error;
            }
        }
        if (message.copyRecord != null && message.hasOwnProperty("copyRecord")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            {
                let error = $root.CopyRecord.verify(message.copyRecord);
                if (error)
                    return "copyRecord." + error;
            }
        }
        if (message.tagged != null && message.hasOwnProperty("tagged")) {
            if (properties.it === 1)
                return "it: multiple values";
            properties.it = 1;
            {
                let error = $root.Tagged.verify(message.tagged);
                if (error)
                    return "tagged." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Passable message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Passable
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Passable} Passable
     */
    Passable.fromObject = function fromObject(object) {
        if (object instanceof $root.Passable)
            return object;
        let message = new $root.Passable();
        if (object["null"] != null) {
            if (typeof object["null"] !== "object")
                throw TypeError(".Passable.null: object expected");
            message["null"] = $root.Null.fromObject(object["null"]);
        }
        if (object.undefined != null) {
            if (typeof object.undefined !== "object")
                throw TypeError(".Passable.undefined: object expected");
            message.undefined = $root.Undefined.fromObject(object.undefined);
        }
        if (object.bool != null)
            message.bool = Boolean(object.bool);
        if (object.number != null)
            message.number = Number(object.number);
        if (object.string != null)
            message.string = String(object.string);
        if (object.bigint != null)
            if (typeof object.bigint === "string")
                $util.base64.decode(object.bigint, message.bigint = $util.newBuffer($util.base64.length(object.bigint)), 0);
            else if (object.bigint.length >= 0)
                message.bigint = object.bigint;
        if (object.remotable != null) {
            if (typeof object.remotable !== "object")
                throw TypeError(".Passable.remotable: object expected");
            message.remotable = $root.Remotable.fromObject(object.remotable);
        }
        if (object.error != null) {
            if (typeof object.error !== "object")
                throw TypeError(".Passable.error: object expected");
            message.error = $root.Error.fromObject(object.error);
        }
        if (object.promise != null) {
            if (typeof object.promise !== "object")
                throw TypeError(".Passable.promise: object expected");
            message.promise = $root.Promise.fromObject(object.promise);
        }
        if (object.symbol != null)
            message.symbol = String(object.symbol);
        if (object.copyArray != null) {
            if (typeof object.copyArray !== "object")
                throw TypeError(".Passable.copyArray: object expected");
            message.copyArray = $root.CopyArray.fromObject(object.copyArray);
        }
        if (object.copyRecord != null) {
            if (typeof object.copyRecord !== "object")
                throw TypeError(".Passable.copyRecord: object expected");
            message.copyRecord = $root.CopyRecord.fromObject(object.copyRecord);
        }
        if (object.tagged != null) {
            if (typeof object.tagged !== "object")
                throw TypeError(".Passable.tagged: object expected");
            message.tagged = $root.Tagged.fromObject(object.tagged);
        }
        return message;
    };

    /**
     * Creates a plain object from a Passable message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Passable
     * @static
     * @param {Passable} message Passable
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Passable.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (message["null"] != null && message.hasOwnProperty("null")) {
            object["null"] = $root.Null.toObject(message["null"], options);
            if (options.oneofs)
                object.it = "null";
        }
        if (message.undefined != null && message.hasOwnProperty("undefined")) {
            object.undefined = $root.Undefined.toObject(message.undefined, options);
            if (options.oneofs)
                object.it = "undefined";
        }
        if (message.bool != null && message.hasOwnProperty("bool")) {
            object.bool = message.bool;
            if (options.oneofs)
                object.it = "bool";
        }
        if (message.number != null && message.hasOwnProperty("number")) {
            object.number = options.json && !isFinite(message.number) ? String(message.number) : message.number;
            if (options.oneofs)
                object.it = "number";
        }
        if (message.bigint != null && message.hasOwnProperty("bigint")) {
            object.bigint = options.bytes === String ? $util.base64.encode(message.bigint, 0, message.bigint.length) : options.bytes === Array ? Array.prototype.slice.call(message.bigint) : message.bigint;
            if (options.oneofs)
                object.it = "bigint";
        }
        if (message.string != null && message.hasOwnProperty("string")) {
            object.string = message.string;
            if (options.oneofs)
                object.it = "string";
        }
        if (message.symbol != null && message.hasOwnProperty("symbol")) {
            object.symbol = message.symbol;
            if (options.oneofs)
                object.it = "symbol";
        }
        if (message.copyArray != null && message.hasOwnProperty("copyArray")) {
            object.copyArray = $root.CopyArray.toObject(message.copyArray, options);
            if (options.oneofs)
                object.it = "copyArray";
        }
        if (message.copyRecord != null && message.hasOwnProperty("copyRecord")) {
            object.copyRecord = $root.CopyRecord.toObject(message.copyRecord, options);
            if (options.oneofs)
                object.it = "copyRecord";
        }
        if (message.tagged != null && message.hasOwnProperty("tagged")) {
            object.tagged = $root.Tagged.toObject(message.tagged, options);
            if (options.oneofs)
                object.it = "tagged";
        }
        if (message.remotable != null && message.hasOwnProperty("remotable")) {
            object.remotable = $root.Remotable.toObject(message.remotable, options);
            if (options.oneofs)
                object.it = "remotable";
        }
        if (message.error != null && message.hasOwnProperty("error")) {
            object.error = $root.Error.toObject(message.error, options);
            if (options.oneofs)
                object.it = "error";
        }
        if (message.promise != null && message.hasOwnProperty("promise")) {
            object.promise = $root.Promise.toObject(message.promise, options);
            if (options.oneofs)
                object.it = "promise";
        }
        return object;
    };

    /**
     * Converts this Passable to JSON.
     * @function toJSON
     * @memberof Passable
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Passable.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Passable
     * @function getTypeUrl
     * @memberof Passable
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Passable.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Passable";
    };

    return Passable;
})();

export const Null = $root.Null = (() => {

    /**
     * Properties of a Null.
     * @exports INull
     * @interface INull
     */

    /**
     * Constructs a new Null.
     * @exports Null
     * @classdesc Represents a Null.
     * @implements INull
     * @constructor
     * @param {INull=} [properties] Properties to set
     */
    function Null(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Encodes the specified Null message. Does not implicitly {@link Null.verify|verify} messages.
     * @function encode
     * @memberof Null
     * @static
     * @param {INull} message Null message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Null.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified Null message, length delimited. Does not implicitly {@link Null.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Null
     * @static
     * @param {INull} message Null message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Null.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Null message from the specified reader or buffer.
     * @function decode
     * @memberof Null
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Null} Null
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Null.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Null();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Null message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Null
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Null} Null
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Null.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Null message.
     * @function verify
     * @memberof Null
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Null.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a Null message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Null
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Null} Null
     */
    Null.fromObject = function fromObject(object) {
        if (object instanceof $root.Null)
            return object;
        return new $root.Null();
    };

    /**
     * Creates a plain object from a Null message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Null
     * @static
     * @param {Null} message Null
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Null.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this Null to JSON.
     * @function toJSON
     * @memberof Null
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Null.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Null
     * @function getTypeUrl
     * @memberof Null
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Null.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Null";
    };

    return Null;
})();

export const Undefined = $root.Undefined = (() => {

    /**
     * Properties of an Undefined.
     * @exports IUndefined
     * @interface IUndefined
     */

    /**
     * Constructs a new Undefined.
     * @exports Undefined
     * @classdesc Represents an Undefined.
     * @implements IUndefined
     * @constructor
     * @param {IUndefined=} [properties] Properties to set
     */
    function Undefined(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Encodes the specified Undefined message. Does not implicitly {@link Undefined.verify|verify} messages.
     * @function encode
     * @memberof Undefined
     * @static
     * @param {IUndefined} message Undefined message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Undefined.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified Undefined message, length delimited. Does not implicitly {@link Undefined.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Undefined
     * @static
     * @param {IUndefined} message Undefined message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Undefined.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an Undefined message from the specified reader or buffer.
     * @function decode
     * @memberof Undefined
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Undefined} Undefined
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Undefined.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Undefined();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an Undefined message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Undefined
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Undefined} Undefined
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Undefined.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an Undefined message.
     * @function verify
     * @memberof Undefined
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Undefined.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates an Undefined message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Undefined
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Undefined} Undefined
     */
    Undefined.fromObject = function fromObject(object) {
        if (object instanceof $root.Undefined)
            return object;
        return new $root.Undefined();
    };

    /**
     * Creates a plain object from an Undefined message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Undefined
     * @static
     * @param {Undefined} message Undefined
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Undefined.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this Undefined to JSON.
     * @function toJSON
     * @memberof Undefined
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Undefined.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Undefined
     * @function getTypeUrl
     * @memberof Undefined
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Undefined.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Undefined";
    };

    return Undefined;
})();

export const CopyArray = $root.CopyArray = (() => {

    /**
     * Properties of a CopyArray.
     * @exports ICopyArray
     * @interface ICopyArray
     * @property {Array.<IPassable>|null} [item] CopyArray item
     */

    /**
     * Constructs a new CopyArray.
     * @exports CopyArray
     * @classdesc Represents a CopyArray.
     * @implements ICopyArray
     * @constructor
     * @param {ICopyArray=} [properties] Properties to set
     */
    function CopyArray(properties) {
        this.item = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * CopyArray item.
     * @member {Array.<IPassable>} item
     * @memberof CopyArray
     * @instance
     */
    CopyArray.prototype.item = $util.emptyArray;

    /**
     * Encodes the specified CopyArray message. Does not implicitly {@link CopyArray.verify|verify} messages.
     * @function encode
     * @memberof CopyArray
     * @static
     * @param {ICopyArray} message CopyArray message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CopyArray.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.item != null && message.item.length)
            for (let i = 0; i < message.item.length; ++i)
                $root.Passable.encode(message.item[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified CopyArray message, length delimited. Does not implicitly {@link CopyArray.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CopyArray
     * @static
     * @param {ICopyArray} message CopyArray message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CopyArray.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CopyArray message from the specified reader or buffer.
     * @function decode
     * @memberof CopyArray
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CopyArray} CopyArray
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CopyArray.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CopyArray();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.item && message.item.length))
                        message.item = [];
                    message.item.push($root.Passable.decode(reader, reader.uint32()));
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CopyArray message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CopyArray
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CopyArray} CopyArray
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CopyArray.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CopyArray message.
     * @function verify
     * @memberof CopyArray
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CopyArray.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.item != null && message.hasOwnProperty("item")) {
            if (!Array.isArray(message.item))
                return "item: array expected";
            for (let i = 0; i < message.item.length; ++i) {
                let error = $root.Passable.verify(message.item[i]);
                if (error)
                    return "item." + error;
            }
        }
        return null;
    };

    /**
     * Creates a CopyArray message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CopyArray
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CopyArray} CopyArray
     */
    CopyArray.fromObject = function fromObject(object) {
        if (object instanceof $root.CopyArray)
            return object;
        let message = new $root.CopyArray();
        if (object.item) {
            if (!Array.isArray(object.item))
                throw TypeError(".CopyArray.item: array expected");
            message.item = [];
            for (let i = 0; i < object.item.length; ++i) {
                if (typeof object.item[i] !== "object")
                    throw TypeError(".CopyArray.item: object expected");
                message.item[i] = $root.Passable.fromObject(object.item[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a CopyArray message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CopyArray
     * @static
     * @param {CopyArray} message CopyArray
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CopyArray.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults)
            object.item = [];
        if (message.item && message.item.length) {
            object.item = [];
            for (let j = 0; j < message.item.length; ++j)
                object.item[j] = $root.Passable.toObject(message.item[j], options);
        }
        return object;
    };

    /**
     * Converts this CopyArray to JSON.
     * @function toJSON
     * @memberof CopyArray
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CopyArray.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CopyArray
     * @function getTypeUrl
     * @memberof CopyArray
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CopyArray.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CopyArray";
    };

    return CopyArray;
})();

export const CopyRecord = $root.CopyRecord = (() => {

    /**
     * Properties of a CopyRecord.
     * @exports ICopyRecord
     * @interface ICopyRecord
     * @property {Array.<IMapFieldEntry>|null} [entry] CopyRecord entry
     */

    /**
     * Constructs a new CopyRecord.
     * @exports CopyRecord
     * @classdesc Represents a CopyRecord.
     * @implements ICopyRecord
     * @constructor
     * @param {ICopyRecord=} [properties] Properties to set
     */
    function CopyRecord(properties) {
        this.entry = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * CopyRecord entry.
     * @member {Array.<IMapFieldEntry>} entry
     * @memberof CopyRecord
     * @instance
     */
    CopyRecord.prototype.entry = $util.emptyArray;

    /**
     * Encodes the specified CopyRecord message. Does not implicitly {@link CopyRecord.verify|verify} messages.
     * @function encode
     * @memberof CopyRecord
     * @static
     * @param {ICopyRecord} message CopyRecord message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CopyRecord.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.entry != null && message.entry.length)
            for (let i = 0; i < message.entry.length; ++i)
                $root.MapFieldEntry.encode(message.entry[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified CopyRecord message, length delimited. Does not implicitly {@link CopyRecord.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CopyRecord
     * @static
     * @param {ICopyRecord} message CopyRecord message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CopyRecord.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CopyRecord message from the specified reader or buffer.
     * @function decode
     * @memberof CopyRecord
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CopyRecord} CopyRecord
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CopyRecord.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.CopyRecord();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.entry && message.entry.length))
                        message.entry = [];
                    message.entry.push($root.MapFieldEntry.decode(reader, reader.uint32()));
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CopyRecord message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CopyRecord
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CopyRecord} CopyRecord
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CopyRecord.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CopyRecord message.
     * @function verify
     * @memberof CopyRecord
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CopyRecord.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.entry != null && message.hasOwnProperty("entry")) {
            if (!Array.isArray(message.entry))
                return "entry: array expected";
            for (let i = 0; i < message.entry.length; ++i) {
                let error = $root.MapFieldEntry.verify(message.entry[i]);
                if (error)
                    return "entry." + error;
            }
        }
        return null;
    };

    /**
     * Creates a CopyRecord message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CopyRecord
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CopyRecord} CopyRecord
     */
    CopyRecord.fromObject = function fromObject(object) {
        if (object instanceof $root.CopyRecord)
            return object;
        let message = new $root.CopyRecord();
        if (object.entry) {
            if (!Array.isArray(object.entry))
                throw TypeError(".CopyRecord.entry: array expected");
            message.entry = [];
            for (let i = 0; i < object.entry.length; ++i) {
                if (typeof object.entry[i] !== "object")
                    throw TypeError(".CopyRecord.entry: object expected");
                message.entry[i] = $root.MapFieldEntry.fromObject(object.entry[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a CopyRecord message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CopyRecord
     * @static
     * @param {CopyRecord} message CopyRecord
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CopyRecord.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults)
            object.entry = [];
        if (message.entry && message.entry.length) {
            object.entry = [];
            for (let j = 0; j < message.entry.length; ++j)
                object.entry[j] = $root.MapFieldEntry.toObject(message.entry[j], options);
        }
        return object;
    };

    /**
     * Converts this CopyRecord to JSON.
     * @function toJSON
     * @memberof CopyRecord
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CopyRecord.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CopyRecord
     * @function getTypeUrl
     * @memberof CopyRecord
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CopyRecord.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CopyRecord";
    };

    return CopyRecord;
})();

export const MapFieldEntry = $root.MapFieldEntry = (() => {

    /**
     * Properties of a MapFieldEntry.
     * @exports IMapFieldEntry
     * @interface IMapFieldEntry
     * @property {string|null} [key] MapFieldEntry key
     * @property {IPassable|null} [value] MapFieldEntry value
     */

    /**
     * Constructs a new MapFieldEntry.
     * @exports MapFieldEntry
     * @classdesc Represents a MapFieldEntry.
     * @implements IMapFieldEntry
     * @constructor
     * @param {IMapFieldEntry=} [properties] Properties to set
     */
    function MapFieldEntry(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * MapFieldEntry key.
     * @member {string} key
     * @memberof MapFieldEntry
     * @instance
     */
    MapFieldEntry.prototype.key = "";

    /**
     * MapFieldEntry value.
     * @member {IPassable|null|undefined} value
     * @memberof MapFieldEntry
     * @instance
     */
    MapFieldEntry.prototype.value = null;

    /**
     * Encodes the specified MapFieldEntry message. Does not implicitly {@link MapFieldEntry.verify|verify} messages.
     * @function encode
     * @memberof MapFieldEntry
     * @static
     * @param {IMapFieldEntry} message MapFieldEntry message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MapFieldEntry.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.key != null && Object.hasOwnProperty.call(message, "key"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
        if (message.value != null && Object.hasOwnProperty.call(message, "value"))
            $root.Passable.encode(message.value, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified MapFieldEntry message, length delimited. Does not implicitly {@link MapFieldEntry.verify|verify} messages.
     * @function encodeDelimited
     * @memberof MapFieldEntry
     * @static
     * @param {IMapFieldEntry} message MapFieldEntry message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MapFieldEntry.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a MapFieldEntry message from the specified reader or buffer.
     * @function decode
     * @memberof MapFieldEntry
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {MapFieldEntry} MapFieldEntry
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MapFieldEntry.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.MapFieldEntry();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.key = reader.string();
                    break;
                }
            case 2: {
                    message.value = $root.Passable.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a MapFieldEntry message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof MapFieldEntry
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {MapFieldEntry} MapFieldEntry
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MapFieldEntry.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a MapFieldEntry message.
     * @function verify
     * @memberof MapFieldEntry
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    MapFieldEntry.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.key != null && message.hasOwnProperty("key"))
            if (!$util.isString(message.key))
                return "key: string expected";
        if (message.value != null && message.hasOwnProperty("value")) {
            let error = $root.Passable.verify(message.value);
            if (error)
                return "value." + error;
        }
        return null;
    };

    /**
     * Creates a MapFieldEntry message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof MapFieldEntry
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {MapFieldEntry} MapFieldEntry
     */
    MapFieldEntry.fromObject = function fromObject(object) {
        if (object instanceof $root.MapFieldEntry)
            return object;
        let message = new $root.MapFieldEntry();
        if (object.key != null)
            message.key = String(object.key);
        if (object.value != null) {
            if (typeof object.value !== "object")
                throw TypeError(".MapFieldEntry.value: object expected");
            message.value = $root.Passable.fromObject(object.value);
        }
        return message;
    };

    /**
     * Creates a plain object from a MapFieldEntry message. Also converts values to other types if specified.
     * @function toObject
     * @memberof MapFieldEntry
     * @static
     * @param {MapFieldEntry} message MapFieldEntry
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    MapFieldEntry.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.key = "";
            object.value = null;
        }
        if (message.key != null && message.hasOwnProperty("key"))
            object.key = message.key;
        if (message.value != null && message.hasOwnProperty("value"))
            object.value = $root.Passable.toObject(message.value, options);
        return object;
    };

    /**
     * Converts this MapFieldEntry to JSON.
     * @function toJSON
     * @memberof MapFieldEntry
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    MapFieldEntry.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for MapFieldEntry
     * @function getTypeUrl
     * @memberof MapFieldEntry
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    MapFieldEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/MapFieldEntry";
    };

    return MapFieldEntry;
})();

export const Tagged = $root.Tagged = (() => {

    /**
     * Properties of a Tagged.
     * @exports ITagged
     * @interface ITagged
     * @property {string|null} [tag] Tagged tag
     * @property {IPassable|null} [payload] Tagged payload
     */

    /**
     * Constructs a new Tagged.
     * @exports Tagged
     * @classdesc Represents a Tagged.
     * @implements ITagged
     * @constructor
     * @param {ITagged=} [properties] Properties to set
     */
    function Tagged(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Tagged tag.
     * @member {string} tag
     * @memberof Tagged
     * @instance
     */
    Tagged.prototype.tag = "";

    /**
     * Tagged payload.
     * @member {IPassable|null|undefined} payload
     * @memberof Tagged
     * @instance
     */
    Tagged.prototype.payload = null;

    /**
     * Encodes the specified Tagged message. Does not implicitly {@link Tagged.verify|verify} messages.
     * @function encode
     * @memberof Tagged
     * @static
     * @param {ITagged} message Tagged message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Tagged.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
            writer.uint32(/* id 0, wireType 2 =*/2).string(message.tag);
        if (message.payload != null && Object.hasOwnProperty.call(message, "payload"))
            $root.Passable.encode(message.payload, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Tagged message, length delimited. Does not implicitly {@link Tagged.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Tagged
     * @static
     * @param {ITagged} message Tagged message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Tagged.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Tagged message from the specified reader or buffer.
     * @function decode
     * @memberof Tagged
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Tagged} Tagged
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Tagged.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Tagged();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 0: {
                    message.tag = reader.string();
                    break;
                }
            case 1: {
                    message.payload = $root.Passable.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Tagged message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Tagged
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Tagged} Tagged
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Tagged.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Tagged message.
     * @function verify
     * @memberof Tagged
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Tagged.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.tag != null && message.hasOwnProperty("tag"))
            if (!$util.isString(message.tag))
                return "tag: string expected";
        if (message.payload != null && message.hasOwnProperty("payload")) {
            let error = $root.Passable.verify(message.payload);
            if (error)
                return "payload." + error;
        }
        return null;
    };

    /**
     * Creates a Tagged message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Tagged
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Tagged} Tagged
     */
    Tagged.fromObject = function fromObject(object) {
        if (object instanceof $root.Tagged)
            return object;
        let message = new $root.Tagged();
        if (object.tag != null)
            message.tag = String(object.tag);
        if (object.payload != null) {
            if (typeof object.payload !== "object")
                throw TypeError(".Tagged.payload: object expected");
            message.payload = $root.Passable.fromObject(object.payload);
        }
        return message;
    };

    /**
     * Creates a plain object from a Tagged message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Tagged
     * @static
     * @param {Tagged} message Tagged
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Tagged.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.tag = "";
            object.payload = null;
        }
        if (message.tag != null && message.hasOwnProperty("tag"))
            object.tag = message.tag;
        if (message.payload != null && message.hasOwnProperty("payload"))
            object.payload = $root.Passable.toObject(message.payload, options);
        return object;
    };

    /**
     * Converts this Tagged to JSON.
     * @function toJSON
     * @memberof Tagged
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Tagged.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Tagged
     * @function getTypeUrl
     * @memberof Tagged
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Tagged.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Tagged";
    };

    return Tagged;
})();

export const Remotable = $root.Remotable = (() => {

    /**
     * Properties of a Remotable.
     * @exports IRemotable
     * @interface IRemotable
     * @property {number|null} [index] Remotable index
     * @property {string|null} [iface] Remotable iface
     */

    /**
     * Constructs a new Remotable.
     * @exports Remotable
     * @classdesc encodePassable() leaves encoding Remotes to the caller,
     * so this is an example convention layered on top.
     * @implements IRemotable
     * @constructor
     * @param {IRemotable=} [properties] Properties to set
     */
    function Remotable(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Remotable index.
     * @member {number} index
     * @memberof Remotable
     * @instance
     */
    Remotable.prototype.index = 0;

    /**
     * Remotable iface.
     * @member {string|null|undefined} iface
     * @memberof Remotable
     * @instance
     */
    Remotable.prototype.iface = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * Remotable _iface.
     * @member {"iface"|undefined} _iface
     * @memberof Remotable
     * @instance
     */
    Object.defineProperty(Remotable.prototype, "_iface", {
        get: $util.oneOfGetter($oneOfFields = ["iface"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Encodes the specified Remotable message. Does not implicitly {@link Remotable.verify|verify} messages.
     * @function encode
     * @memberof Remotable
     * @static
     * @param {IRemotable} message Remotable message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Remotable.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.index != null && Object.hasOwnProperty.call(message, "index"))
            writer.uint32(/* id 0, wireType 0 =*/0).uint32(message.index);
        if (message.iface != null && Object.hasOwnProperty.call(message, "iface"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.iface);
        return writer;
    };

    /**
     * Encodes the specified Remotable message, length delimited. Does not implicitly {@link Remotable.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Remotable
     * @static
     * @param {IRemotable} message Remotable message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Remotable.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Remotable message from the specified reader or buffer.
     * @function decode
     * @memberof Remotable
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Remotable} Remotable
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Remotable.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Remotable();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 0: {
                    message.index = reader.uint32();
                    break;
                }
            case 1: {
                    message.iface = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Remotable message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Remotable
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Remotable} Remotable
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Remotable.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Remotable message.
     * @function verify
     * @memberof Remotable
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Remotable.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        let properties = {};
        if (message.index != null && message.hasOwnProperty("index"))
            if (!$util.isInteger(message.index))
                return "index: integer expected";
        if (message.iface != null && message.hasOwnProperty("iface")) {
            properties._iface = 1;
            if (!$util.isString(message.iface))
                return "iface: string expected";
        }
        return null;
    };

    /**
     * Creates a Remotable message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Remotable
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Remotable} Remotable
     */
    Remotable.fromObject = function fromObject(object) {
        if (object instanceof $root.Remotable)
            return object;
        let message = new $root.Remotable();
        if (object.index != null)
            message.index = object.index >>> 0;
        if (object.iface != null)
            message.iface = String(object.iface);
        return message;
    };

    /**
     * Creates a plain object from a Remotable message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Remotable
     * @static
     * @param {Remotable} message Remotable
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Remotable.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.index = 0;
        if (message.index != null && message.hasOwnProperty("index"))
            object.index = message.index;
        if (message.iface != null && message.hasOwnProperty("iface")) {
            object.iface = message.iface;
            if (options.oneofs)
                object._iface = "iface";
        }
        return object;
    };

    /**
     * Converts this Remotable to JSON.
     * @function toJSON
     * @memberof Remotable
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Remotable.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Remotable
     * @function getTypeUrl
     * @memberof Remotable
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Remotable.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Remotable";
    };

    return Remotable;
})();

export const Promise = $root.Promise = (() => {

    /**
     * Properties of a Promise.
     * @exports IPromise
     * @interface IPromise
     * @property {number|null} [index] Promise index
     */

    /**
     * Constructs a new Promise.
     * @exports Promise
     * @classdesc Represents a Promise.
     * @implements IPromise
     * @constructor
     * @param {IPromise=} [properties] Properties to set
     */
    function Promise(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Promise index.
     * @member {number} index
     * @memberof Promise
     * @instance
     */
    Promise.prototype.index = 0;

    /**
     * Encodes the specified Promise message. Does not implicitly {@link Promise.verify|verify} messages.
     * @function encode
     * @memberof Promise
     * @static
     * @param {IPromise} message Promise message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Promise.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.index != null && Object.hasOwnProperty.call(message, "index"))
            writer.uint32(/* id 0, wireType 0 =*/0).uint32(message.index);
        return writer;
    };

    /**
     * Encodes the specified Promise message, length delimited. Does not implicitly {@link Promise.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Promise
     * @static
     * @param {IPromise} message Promise message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Promise.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Promise message from the specified reader or buffer.
     * @function decode
     * @memberof Promise
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Promise} Promise
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Promise.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Promise();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 0: {
                    message.index = reader.uint32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Promise message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Promise
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Promise} Promise
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Promise.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Promise message.
     * @function verify
     * @memberof Promise
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Promise.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.index != null && message.hasOwnProperty("index"))
            if (!$util.isInteger(message.index))
                return "index: integer expected";
        return null;
    };

    /**
     * Creates a Promise message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Promise
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Promise} Promise
     */
    Promise.fromObject = function fromObject(object) {
        if (object instanceof $root.Promise)
            return object;
        let message = new $root.Promise();
        if (object.index != null)
            message.index = object.index >>> 0;
        return message;
    };

    /**
     * Creates a plain object from a Promise message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Promise
     * @static
     * @param {Promise} message Promise
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Promise.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            object.index = 0;
        if (message.index != null && message.hasOwnProperty("index"))
            object.index = message.index;
        return object;
    };

    /**
     * Converts this Promise to JSON.
     * @function toJSON
     * @memberof Promise
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Promise.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Promise
     * @function getTypeUrl
     * @memberof Promise
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Promise.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Promise";
    };

    return Promise;
})();

export const Error = $root.Error = (() => {

    /**
     * Properties of an Error.
     * @exports IError
     * @interface IError
     * @property {string|null} [name] Error name
     * @property {string|null} [message] Error message
     */

    /**
     * Constructs a new Error.
     * @exports Error
     * @classdesc Represents an Error.
     * @implements IError
     * @constructor
     * @param {IError=} [properties] Properties to set
     */
    function Error(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Error name.
     * @member {string} name
     * @memberof Error
     * @instance
     */
    Error.prototype.name = "";

    /**
     * Error message.
     * @member {string} message
     * @memberof Error
     * @instance
     */
    Error.prototype.message = "";

    /**
     * Encodes the specified Error message. Does not implicitly {@link Error.verify|verify} messages.
     * @function encode
     * @memberof Error
     * @static
     * @param {IError} message Error message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Error.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 0, wireType 2 =*/2).string(message.name);
        if (message.message != null && Object.hasOwnProperty.call(message, "message"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.message);
        return writer;
    };

    /**
     * Encodes the specified Error message, length delimited. Does not implicitly {@link Error.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Error
     * @static
     * @param {IError} message Error message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Error.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an Error message from the specified reader or buffer.
     * @function decode
     * @memberof Error
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Error} Error
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Error.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Error();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 0: {
                    message.name = reader.string();
                    break;
                }
            case 1: {
                    message.message = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an Error message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Error
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Error} Error
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Error.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an Error message.
     * @function verify
     * @memberof Error
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Error.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.message != null && message.hasOwnProperty("message"))
            if (!$util.isString(message.message))
                return "message: string expected";
        return null;
    };

    /**
     * Creates an Error message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Error
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Error} Error
     */
    Error.fromObject = function fromObject(object) {
        if (object instanceof $root.Error)
            return object;
        let message = new $root.Error();
        if (object.name != null)
            message.name = String(object.name);
        if (object.message != null)
            message.message = String(object.message);
        return message;
    };

    /**
     * Creates a plain object from an Error message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Error
     * @static
     * @param {Error} message Error
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Error.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.name = "";
            object.message = "";
        }
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.message != null && message.hasOwnProperty("message"))
            object.message = message.message;
        return object;
    };

    /**
     * Converts this Error to JSON.
     * @function toJSON
     * @memberof Error
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Error.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Error
     * @function getTypeUrl
     * @memberof Error
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Error.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Error";
    };

    return Error;
})();

export { $root as default };
