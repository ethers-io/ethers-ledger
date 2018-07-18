
declare module "@ledgerhq/hw-app-eth" {
    export type Config = {
        arbitraryDataEnabled: number,
        version: string
    };

    export type Signature = {
        r: string,
        s: string,
        v: number
    };

    export class LedgerEth {
        constructor(transport: Transport);
        getAppConfiguration(): Promise<Config>;
        getAddress(path: string): Promise<any>;
        signPersonalMessage(path: string, message: string): Promise<Signature>;
        signTransaction(path: string, unsignedTx: any): Promise<Signature>;
    }

    export default LedgerEth;
}

declare module "@ledgerhq/hw-transport-node-hid" {
    export class Transport { }
    export function create(): Promise<Transport>;
}

declare module "@ledgerhq/hw-transport-u2f" {
    export class Transport { }
    export function create(): Promise<Transport>;
}
