ethers-ledger
=============

This is just a quick sample I threw together, it needs a lot more work
to detect and relay meaningful errors to the application developer.

Importing
---------

**Node.js**

This will connect to the Ledger via the HID protocol.

```javascript
const { LedgerSigner } = require('ledger-signer');
```

**Browser**

This will connect to the Ledger via the U2F protocol, which requires a compatible
browser (e.g. Chrome, Opera) and the site **must** be hosted on an SSL site. The
Ledger **must** also be in "Broswer Mode".

```javascript
<!-- MUST load the ethers library first -->
<script src="" type="text/javascript">
<script src="" type="text/javascript">
<script type="text/javascript">
    const LedgerSigner = ethers.LedgerSigner;
</script>
```

**TypeScript**

```javascript
import { LedgerSigner } from "ledger-signer";
```

API
---

```javascript

// Options are optional; this is the default
let options = {
    path: "m'/44'/0'/0'/0/0"
};

let provider = ethers.providers.getDefaultProvider();

// Connect using the default Transport
// - In the browserified (dist) library, the U2F interface
// - In node.js, the HID interface
let signer = LedgerSigner.connect(provider, options);

signer.getAddress().then((address) => {
    console.log(address);
    // "0x3474109b624516B7D321a3C31b8Ca2d9828B0C0d"
});

let message = "Hello!"
signer.signMessage(message).then((signature) => {
    console.log(sinature);
    // "0xa41fd558e58c5711bdf08612491e69918c134ed03caf31bdfcfa8ad36843eb64" +
    //   "2f6181eae8be023bc592dfe39e740010c2a73f1dd654af2bd4d8b654daa9b524" +
    //   "1c"
});

let binaryMessage = [ 72, 101, 108, 108, 111, 33 ];
signer.signMessage(binaryMessage).then((signature) => {
    // See signMessage above
});

signer.signTransaction(tx).then((signedRawTx) => {
    console.log(signedRawTx);
    // "0xf85d80808094123456789012345678901234567890123456789001801ba0524f" +
    //   "5fb8ab43ca7aad2e14bdf187d1972f5a9d82a4395c7b19cb90839acd1a25a024" +
    //   "567cfffb8c327a556ce17ca784903bec4724487a39c9ca8c769e6f68894352"
});

// This requires a provider was provided
signer.sendTransaction(tx).then((tx) => {
    console.log(tx);
    // "0x..."
});

let ropstenProvider = ethers.providers.getDefaultProvider('ropsten');
let ropstenSigner = signer.connect(ropstenProvider);
```

Custom Transport
----------------

If you need to specify the transport to use, the constructor can be called
directly:

```
let signer = new LedgerSigner(transport, provider, options);
```

License
-------

MIT License.
