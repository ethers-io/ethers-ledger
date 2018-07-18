"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var hw_app_eth_1 = __importDefault(require("@ledgerhq/hw-app-eth"));
var transport_1 = require("./transport");
var LedgerSigner = /** @class */ (function (_super) {
    __extends(LedgerSigner, _super);
    function LedgerSigner(transport, provider, options) {
        var _this = _super.call(this) || this;
        if (!options) {
            options = {};
        }
        if (!options.path) {
            options.path = ethers_1.ethers.HDNode.defaultPath;
        }
        ;
        ethers_1.ethers.utils.defineReadOnly(_this, 'provider', provider);
        ethers_1.ethers.utils.defineReadOnly(_this, 'path', options.path);
        ethers_1.ethers.utils.defineReadOnly(_this, '_eth', new hw_app_eth_1.default(transport));
        _this._ready = _this._eth.getAppConfiguration().then(function (result) {
            _this._config = JSON.stringify(result);
        });
        _this._pending = _this._ready;
        _this._config = JSON.stringify(null);
        return _this;
    }
    Object.defineProperty(LedgerSigner.prototype, "config", {
        get: function () {
            return JSON.parse(this._config);
        },
        enumerable: true,
        configurable: true
    });
    LedgerSigner.prototype.getConfig = function () {
        var _this = this;
        return this._ready.then(function () {
            return _this.config;
        });
    };
    LedgerSigner.prototype.getAddress = function () {
        var _this = this;
        var addressPromise = this._pending.then(function () {
            return _this._eth.getAddress(_this.path).then(function (result) {
                return ethers_1.ethers.utils.getAddress(result.address);
            });
        });
        this._pending = addressPromise;
        return addressPromise;
    };
    LedgerSigner.prototype.sign = function (transaction) {
        var _this = this;
        return ethers_1.ethers.utils.resolveProperties(transaction).then(function (tx) {
            var unsignedTx = ethers_1.ethers.utils.serializeTransaction(tx).substring(2);
            var signPromise = _this._pending.then(function () {
                return _this._eth.signTransaction(_this.path, unsignedTx).then(function (signature) {
                    var sig = {
                        v: signature.v,
                        r: '0x' + signature.r,
                        s: '0x' + signature.s,
                    };
                    return ethers_1.ethers.utils.serializeTransaction(tx, sig);
                });
            });
            _this._pending = signPromise;
            return signPromise;
        });
    };
    LedgerSigner.prototype.sendTransaction = function (transaction) {
        var _this = this;
        return this.sign(transaction).then(function (signedTx) {
            return _this.provider.sendTransaction(signedTx);
        });
    };
    LedgerSigner.prototype.signMessage = function (message) {
        var _this = this;
        if (typeof (message) === 'string') {
            message = ethers_1.ethers.utils.toUtf8Bytes(message);
        }
        var messageHex = ethers_1.ethers.utils.hexlify(message).substring(2);
        this._pending = this._pending.then(function () {
            return _this._eth.signPersonalMessage(_this.path, messageHex).then(function (signature) {
                signature.r = '0x' + signature.r;
                signature.s = '0x' + signature.s;
                return ethers_1.ethers.utils.joinSignature(signature);
            });
        });
        return this._pending;
    };
    LedgerSigner.connect = function (provider, options) {
        return transport_1.Transport.create().then(function (transport) {
            return new LedgerSigner(transport, provider, options);
        });
    };
    return LedgerSigner;
}(ethers_1.ethers.types.Signer));
exports.LedgerSigner = LedgerSigner;
// If this is browserified, we inject the LedgerSigner into the ethers object
if (transport_1.platform === 'browser' && global.ethers) {
    global.ethers.LedgerSigner = LedgerSigner;
}
