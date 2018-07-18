
import { ethers } from 'ethers';
import LedgerEth from "@ledgerhq/hw-app-eth";

import { platform, Transport } from './transport';

export type Options = {
    path?: string
}

export class LedgerSigner extends ethers.types.Signer {
    readonly path: string;

    private _config: string;
    private _eth: LedgerEth;

    private _pending: Promise<any>;
    private _ready: Promise<void>

    constructor(transport: any, provider: ethers.providers.Provider, options?: Options) {
        super();

        if (!options) { options = { }; }
        if (!options.path) { options.path = ethers.HDNode.defaultPath; };

        ethers.utils.defineReadOnly(this, 'provider', provider);
        ethers.utils.defineReadOnly(this, 'path', options.path);

        ethers.utils.defineReadOnly(this, '_eth', new LedgerEth(transport));

        this._ready = this._eth.getAppConfiguration().then((result) => {
            this._config = JSON.stringify(result);
        });

        this._pending = this._ready;


        this._config = JSON.stringify(null);

    }

    get config(): any {
        return JSON.parse(this._config);
    }

    getConfig(): Promise<any> {
        return this._ready.then(() => {
            return this.config;
        });
    }

    getAddress(): Promise<string> {
        let addressPromise = this._pending.then(() => {
            return this._eth.getAddress(this.path).then((result) => {
                return ethers.utils.getAddress(result.address);
            });
        });
        this._pending = addressPromise;
        return addressPromise;
    }

    sign(transaction: ethers.types.TransactionRequest): Promise<string> {
        return ethers.utils.resolveProperties(transaction).then((tx) => {
            let unsignedTx = ethers.utils.serializeTransaction(tx).substring(2);

            let signPromise = this._pending.then(() => {
                return this._eth.signTransaction(this.path, unsignedTx).then((signature) => {
                    let sig = {
                        v: signature.v,
                        r: '0x' + signature.r,
                        s: '0x' + signature.s,
                    };
                    return ethers.utils.serializeTransaction(tx, sig);
                });
            });
            this._pending = signPromise;

            return signPromise;
        });
    }

    sendTransaction(transaction: ethers.types.TransactionRequest): Promise<ethers.types.TransactionResponse> {
        return this.sign(transaction).then((signedTx) => {
            return this.provider.sendTransaction(signedTx);
        });
    }

    signMessage(message: ethers.types.Arrayish | string): Promise<string> {
        if (typeof(message) === 'string') {
            message = ethers.utils.toUtf8Bytes(message);
        }

        let messageHex = ethers.utils.hexlify(message).substring(2);

        this._pending = this._pending.then(() => {
            return this._eth.signPersonalMessage(this.path, messageHex).then((signature) => {
                signature.r = '0x' + signature.r;
                signature.s = '0x' + signature.s;
                return ethers.utils.joinSignature(signature);
            });
        });

        return this._pending;
    }

    static connect(provider: ethers.providers.Provider, options?: Options): Promise<LedgerSigner> {
        return Transport.create().then((transport) => {
            return new LedgerSigner(transport, provider, options);
        });
    }
}

// If this is browserified, we inject the LedgerSigner into the ethers object
if ((<string>platform) === 'browser' && (<any>global).ethers) {
    (<any>global).ethers.LedgerSigner = LedgerSigner;
}
