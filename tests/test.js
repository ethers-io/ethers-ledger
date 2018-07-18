const ethers = require('ethers');
const { LedgerSigner } = require('..');

console.log(LedgerSigner);

let provider = ethers.providers.getDefaultProvider();
LedgerSigner.connect(provider).then((signer) => {

    signer.getConfig().then((config) => {
        console.log('Config', config);
    });

    signer.getAddress().then((address) => {
        console.log('Address', address);
    });

    signer.sign({ to: "0x1234567890123456789012345678901234567890", value: "0x1" }).then((tx) => {
        console.log('Transaction', tx);
    });

    signer.signMessage("Hello!").then((tx) => {
        console.log('Message', tx);
    });
});

