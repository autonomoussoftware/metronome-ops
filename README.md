# metronome-ops

[![Build Status](https://travis-ci.com/autonomoussoftware/metronome-ops.svg?branch=master)](https://travis-ci.com/autonomoussoftware/metronome-ops)

Basic Metronome Token operations.

More detailed description or notes as needed.

## Installation

```shell
npm install metronome-ops
```

## Usage

```js
const metOps = require('metronome-ops')
const MetronomeContracts = require('metronome-contracts')
const Web3 = require('web3')

const contracts = new MetronomeContracts(new Web3())
metOps.getAuctionStatus(contracts)
  .then(function (status) {
    // `status` contains the current auction data
  })
```

## API

<a name="getAuctionStatus"></a>

### getAuctionStatus(contracts) ⇒ [<code>Promise.&lt;AuctionStatus&gt;</code>](#AuctionStatus)
Get the status of the Auctions contract.

**Returns**: [<code>Promise.&lt;AuctionStatus&gt;</code>](#AuctionStatus) - The status.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.Auctions | <code>Object</code> | The Web3 Auctions contract instance. |

<a name="getConverterStatus"></a>

### getConverterStatus(contracts) ⇒ [<code>Promise.&lt;AutonomousConverterStatus&gt;</code>](#AutonomousConverterStatus)
Get the status of the AutonomousConverter contract.

**Returns**: [<code>Promise.&lt;AutonomousConverterStatus&gt;</code>](#AutonomousConverterStatus) - The status.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.AutonomousConverter | <code>Object</code> | The Web3 contract instance. |

<a name="getMetBalance"></a>

### getMetBalance(contracts, owner) ⇒ <code>Promise.&lt;string&gt;</code>
Get the MET balance of an account.

**Returns**: <code>Promise.&lt;string&gt;</code> - The MET balance.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.METToken | <code>Object</code> | The Web3 contract instance. |
| owner | <code>string</code> | The address of the account. |

<a name="getMetChainName"></a>

### getMetChainName(contracts) ⇒ <code>Promise.&lt;string&gt;</code>
Get the Metronome chain name.

**Returns**: <code>Promise.&lt;string&gt;</code> - The name i.e. `'ETH'`.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.Auctions | <code>Object</code> | The Web3 Auctions contract instance. |

<a name="getCoinsToMetResult"></a>

### getCoinsToMetResult(contracts, depositAmount) ⇒ <code>Promise.&lt;string&gt;</code>
Calculate the coin to MET return conversion.

**Returns**: <code>Promise.&lt;string&gt;</code> - The MET amount that would be returned.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.AutonomousConverter | <code>Object</code> | The Web3 contract instance. |
| depositAmount | <code>string</code> | The coin amount to convert. |

<a name="getMetToCoinsResult"></a>

### getMetToCoinsResult(contracts, depositAmount) ⇒ <code>Promise.&lt;string&gt;</code>
Calculate the MET to coin return conversion.

**Returns**: <code>Promise.&lt;string&gt;</code> - The coin amount that would be returned.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.AutonomousConverter | <code>Object</code> | The Web3 contract instance. |
| depositAmount | <code>string</code> | The MET amount to convert. |

<a name="getDestinationChainData"></a>

### getDestinationChainData(contracts) ⇒ [<code>Promise.&lt;DestinationChainData&gt;</code>](#DestinationChainData)
Get the destination chain data to perform an export.

**Returns**: [<code>Promise.&lt;DestinationChainData&gt;</code>](#DestinationChainData) - The chain data.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.Auctions | <code>Object</code> | The Web3 contract instance. |
| contracts.METToken | <code>Object</code> | The Web3 contract instance. |

<a name="getOriginChainData"></a>

### getOriginChainData(contracts) ⇒ [<code>Promise.&lt;OriginChainData&gt;</code>](#OriginChainData)
Get the destination chain data to perform an export.

**Returns**: [<code>Promise.&lt;OriginChainData&gt;</code>](#OriginChainData) - The chain data.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.Auctions | <code>Object</code> | The Web3 contract instance. |

<a name="getMetExportFee"></a>

### getMetExportFee(contracts, amount, [givenFee]) ⇒ <code>Promise.&lt;string&gt;</code>
Get the minimum MET fee required by the TokenPorter to process a port
operation.

If a fee amount is provided, it will just return that for convenience.

**Returns**: <code>Promise.&lt;string&gt;</code> - The port fee.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.TokenPorter | <code>Object</code> | The Web3 TokenPorter contract instance. |
| amount | <code>string</code> | The coin amount to port. |
| [givenFee] | <code>string</code> | The fee amount. |

<a name="getExportProof"></a>

### getExportProof(contracts, burnSequence) ⇒ <code>Promise.&lt;string&gt;</code>
Get the Merkle root of a last 16 burns.

This is the proof required to import the burned MET into another chain.

**Returns**: <code>Promise.&lt;string&gt;</code> - The Merkle root hash.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.TokenPorter | <code>Object</code> | The Web3 TokenPorter contract instance. |
| burnSequence | <code>string</code> | The burn sequence number. |

<a name="buyMet"></a>

### buyMet(web3, contracts, options) ⇒ [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent)
Buy MET in auction.

**Returns**: [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent) - The wrapped purchase Web3 PromiEvent.  

| Param | Type | Description |
| --- | --- | --- |
| web3 | <code>Object</code> | A Web3 instance. |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.Auctions | <code>Object</code> | The Web3 Auctions contract instance. |
| options | <code>Object</code> | The purchase Web3 transaction object. |
| options.from | <code>string</code> | The sender address. |
| [options.gas] | <code>number</code> | The gas to use. |
| [options.nonce] | <code>number</code> | The nonce. |
| options.value | <code>string</code> | The coins to send to the contract. |

<a name="sendMet"></a>

### sendMet(contracts, params, options) ⇒ [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent)
Transfer MET.

**Returns**: [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent) - The weapped transfer Web3 PromiEvent.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.METToken | <code>Object</code> | The Web3 contract instance. |
| params | <code>Object</code> | The transfer params. |
| params.to | <code>string</code> | The recipient address. |
| params.value | <code>string</code> | The amount to transfer. |
| options | <code>Object</code> | The transfer Web3 transaction options. |
| options.from | <code>string</code> | The sender address. |
| [options.gas] | <code>number</code> | The gas to use. |
| [options.nonce] | <code>number</code> | The nonce. |

<a name="approveMet"></a>

### approveMet(contracts, params, options) ⇒ [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent)
Set MET allowance.

**Returns**: [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent) - The weapped allowance Web3 PromiEvent.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.METToken | <code>Object</code> | The Web3 contract instance. |
| params | <code>Object</code> | The allowance params. |
| params.spender | <code>string</code> | The address allowed to spend tokens. |
| params.value | <code>string</code> | The amount to approve. |
| options | <code>Object</code> | The allowance Web3 transaction options. |
| options.from | <code>string</code> | The sender address. |
| [options.gas] | <code>number</code> | The gas to use. |
| [options.nonce] | <code>number</code> | The nonce. |

<a name="convertCoinsToMet"></a>

### convertCoinsToMet(contracts, params, options) ⇒ [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent)
Convert coins to MET.

**Returns**: [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent) - The weapped conversion Web3 PromiEvent.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.AutonomousConverter | <code>Object</code> | The Web3 contract instance. |
| params | <code>Object</code> | The conversion params. |
| [params.minReturn] | <code>string</code> | Will cancel conversion if minReturn tokens are not obtained. |
| options | <code>Object</code> | The conversion Web3 transaction options. |
| options.from | <code>string</code> | The sender address. |
| [options.gas] | <code>number</code> | The gas to use. |
| [options.nonce] | <code>number</code> | The nonce. |
| options.value | <code>string</code> | The coin amount to convert. |

<a name="convertMetToCoins"></a>

### convertMetToCoins(web3, contracts, params, options) ⇒ <code>Promise.&lt;Array.&lt;WrappedPromiEvent&gt;&gt;</code>
Convert MET to coins.

This is a high-level operation that ensure the AutonomousConverter contract
is allowed to spend MET by the amount willing to be converted. The operation
might then send 1, 2 or 3 transactions depending on the scenario and
therefore will return the same amount of PromiEvents.

**Returns**: <code>Promise.&lt;Array.&lt;WrappedPromiEvent&gt;&gt;</code> - The weapped conversion Web3 PromiEvents.  

| Param | Type | Description |
| --- | --- | --- |
| web3 | <code>Object</code> | A Web3 instance. |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.AutonomousConverter | <code>Object</code> | The Web3 contract instance. |
| contracts.METToken | <code>Object</code> | The Web3 contract instance. |
| params | <code>Object</code> | The conversion params. |
| params.amount | <code>string</code> | The MET amount to convert. |
| [params.minReturn] | <code>string</code> | Will cancel conversion if minReturn tokens are not obtained. |
| options | <code>Object</code> | The conversion Web3 transaction options. |
| options.from | <code>string</code> | The sender address. |

<a name="exportMet"></a>

### exportMet(contracts, params, options) ⇒ [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent)
Initiate an export of MET to another chain and obtain the burn data.

**Returns**: [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent) - The weapped export Web3 PromiEvent.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.METToken | <code>Object</code> | The Web3 contract instance. |
| contracts.TokenPorter | <code>Object</code> | The Web3 contract instance. |
| params | <code>Object</code> | The export params. |
| params.amount | <code>string</code> | The MET amount to burn and export. |
| params.destinationData | [<code>DestinationChainData</code>](#DestinationChainData) | The destination chain data. |
| [params.destRecipAddr] | <code>string</code> | The recipient address. Defaults to sender. |
| [params.extraData] | <code>string</code> | Extra information. |
| [params.fee] | <code>string</code> | The export fee. |
| options | <code>Object</code> | The export Web3 transaction options. |
| options.from | <code>string</code> | The sender address. |
| [options.gas] | <code>number</code> | The gas to use. |
| [options.nonce] | <code>number</code> | The nonce. |

<a name="importMet"></a>

### importMet(contracts, params, options) ⇒ [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent)
Request the import of MET burned on another chain.

This operation will log events the validators will listen in order to
complete the import process by signaling the METToken contract to mint and
transfer the tokens.

**Returns**: [<code>Promise.&lt;WrappedPromiEvent&gt;</code>](#WrappedPromiEvent) - The weapped export Web3 PromiEvent.  

| Param | Type | Description |
| --- | --- | --- |
| contracts | <code>Object</code> | The Metronome contracts. |
| contracts.METToken | <code>Object</code> | The Web3 contract instance. |
| params | <code>Object</code> | The import params. |
| params.exportData | <code>Object</code> | The data obtained when the tokens were exported. |
| params.originData | [<code>OriginChainData</code>](#OriginChainData) | The origin chain data. |
| params.proof | <code>string</code> | The burn proof on the origin chain. |
| options | <code>Object</code> | The export Web3 transaction options. |
| options.from | <code>string</code> | The sender address. |
| [options.gas] | <code>number</code> | The gas to use. |
| [options.nonce] | <code>number</code> | The nonce. |

<a name="AuctionStatus"></a>

### AuctionStatus : <code>Object.&lt;string, any&gt;</code>
An object representing the auction status.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| currAuction | <code>string</code> | The auction number. |
| currentAuctionPrice | <code>string</code> | The MET price. |
| dailyAuctionStartTime | <code>number</code> | The daily auctions start time (ms). |
| genesisTime | <code>number</code> | The ISA start time (ms). |
| lastPurchasePrice | <code>string</code> | The last purchase price. |
| lastPurchaseTime | <code>number</code> | The last purchase time (ms). |
| minting | <code>string</code> | The coins available in the current auction. |
| nextAuctionTime | <code>number</code> | The next auction start time (ms). |

<a name="AutonomousConverterStatus"></a>

### AutonomousConverterStatus : <code>Object</code>
An object representing the autonomous converter status.

The converter price returned is for informational purposes only as the
conversion price will change depending on the amount sent and the contract's
balance.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| currentConverterPrice | <code>string</code> | The coins returned for 1 MET. |
| ethBalance | <code>string</code> | The contract's coins balance. I.e. ETH. |
| metBalance | <code>string</code> | The contract's MET balance. |

<a name="DestinationChainData"></a>

### DestinationChainData : <code>Object</code>
An object having destination contracts data.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| destChain | <code>string</code> | The Metronome chain name. |
| destMetronomeAddr | <code>string</code> | The METToken contract address. |

<a name="OriginChainData"></a>

### OriginChainData : <code>Object</code>
An object having destination contracts data.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| dailyAuctionStartTime | <code>number</code> | The METToken contract address. |
| genesisTime | <code>number</code> | The METToken contract address. |
| originChain | <code>string</code> | The Metronome chain name. |

<a name="WrappedPromiEvent"></a>

### WrappedPromiEvent : <code>Object.&lt;string, any&gt;</code>
A wrapped PromiEvent object.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| promiEvent | <code>Object</code> | A Web3 PromiEvent instance. |

## License

MIT
