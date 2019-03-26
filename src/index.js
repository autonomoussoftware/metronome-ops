'use strict'

const { BN, hexToUtf8, toBN, toHex, toWei } = require('web3-utils')
const debug = require('debug')('met:core')
const promiseAllProps = require('promise-all-props')

const { toInt, toMs, toSec } = require('./utils')
const calcMerkleRoot = require('./merkle-root')

/**
 * An object representing the auction status.
 *
 * @typedef {Object<string, any>} AuctionStatus
 * @property {string} currAuction The auction number.
 * @property {string} currentAuctionPrice The MET price.
 * @property {number} dailyAuctionStartTime The daily auctions start time (ms).
 * @property {number} genesisTime The ISA start time (ms).
 * @property {string} lastPurchasePrice The last purchase price.
 * @property {number} lastPurchaseTime The last purchase time (ms).
 * @property {string} minting The coins available in the current auction.
 * @property {number} nextAuctionTime The next auction start time (ms).
 */

/**
 * Get the status of the Auctions contract.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.Auctions The Web3 Auctions contract instance.
 * @returns {Promise<AuctionStatus>} The status.
 */
const getAuctionStatus = ({ Auctions }) =>
  Promise.all([
    Auctions.methods.dailyAuctionStartTime().call(),
    Auctions.methods.heartbeat().call(),
    Auctions.methods.lastPurchaseTick().call()
  ])
    .then(([
      dailyAuctionStartTime,
      {
        currAuction,
        currentAuctionPrice,
        genesisGMT,
        minting,
        nextAuctionGMT,
        _lastPurchasePrice
      },
      lastPurchaseTick
    ]) => ({
      currAuction,
      currentAuctionPrice,
      dailyAuctionStartTime: toMs(toInt(dailyAuctionStartTime)),
      genesisTime: toMs(toInt(genesisGMT)),
      lastPurchasePrice: _lastPurchasePrice,
      lastPurchaseTime: toMs(toInt(genesisGMT) + toInt(lastPurchaseTick) * 60),
      minting,
      nextAuctionTime: toMs(toInt(nextAuctionGMT))
    }))

/**
 * An object representing the autonomous converter status.
 *
 * The converter price returned is for informational purposes only as the
 * conversion price will change depending on the amount sent and the contract's
 * balance.
 *
 * @typedef {Object} AutonomousConverterStatus
 * @property {string} currentConverterPrice The coins returned for 1 MET.
 * @property {string} ethBalance The contract's coins balance. I.e. ETH.
 * @property {string} metBalance The contract's MET balance.
 */

/**
 * Get the status of the AutonomousConverter contract.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.AutonomousConverter The Web3 contract instance.
 * @returns {Promise<AutonomousConverterStatus>} The status.
 */
const getConverterStatus = ({ AutonomousConverter }) =>
  // @ts-ignore: promise-all-props is not typed
  promiseAllProps({
    currentConverterPrice: AutonomousConverter.methods
      .getEthForMetResult(toWei('1')).call(),
    ethBalance: AutonomousConverter.methods.getEthBalance().call(),
    metBalance: AutonomousConverter.methods.getMetBalance().call()
  })

/**
 * Get the MET balance of an account.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.METToken The Web3 contract instance.
 * @param {string} owner The address of the account.
 * @returns {Promise<string>} The MET balance.
 */
const getMetBalance = ({ METToken }, owner) =>
  METToken.methods.balanceOf(owner).call()

/**
 * Get the Metronome chain name.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.Auctions The Web3 Auctions contract instance.
 * @returns {Promise<string>} The name i.e. `'ETH'`.
 */
const getMetChainName = ({ Auctions }) =>
  Auctions.methods.chain().call()
    .then(hexToUtf8)

/**
 * Calculate the coin to MET return conversion.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.AutonomousConverter The Web3 contract instance.
 * @param {string} depositAmount The coin amount to convert.
 * @returns {Promise<string>} The MET amount that would be returned.
 */
const getCoinsToMetResult = ({ AutonomousConverter }, depositAmount) =>
  AutonomousConverter.methods.getMetForEthResult(depositAmount).call()

/**
 * Calculate the MET to coin return conversion.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.AutonomousConverter The Web3 contract instance.
 * @param {string} depositAmount The MET amount to convert.
 * @returns {Promise<string>} The coin amount that would be returned.
 */
const getMetToCoinsResult = ({ AutonomousConverter }, depositAmount) =>
  AutonomousConverter.methods.getEthForMetResult(depositAmount).call()

/**
 * An object having destination contracts data.
 *
 * @typedef {Object} DestinationChainData
 * @property {string} destChain The Metronome chain name.
 * @property {string} destMetronomeAddr The METToken contract address.
 */

/**
 * Get the destination chain data to perform an export.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.Auctions The Web3 contract instance.
 * @param {Object} contracts.METToken The Web3 contract instance.
 * @returns {Promise<DestinationChainData>} The chain data.
 */
const getDestinationChainData = ({ Auctions, METToken }) =>
  // @ts-ignore: promise-all-props is not typed
  promiseAllProps({
    destChain: getMetChainName({ Auctions }),
    destMetronomeAddr: METToken.options.address
  })

/**
 * An object having destination contracts data.
 *
 * @typedef {Object} OriginChainData
 * @property {number} dailyAuctionStartTime The METToken contract address.
 * @property {number} genesisTime The METToken contract address.
 * @property {string} originChain The Metronome chain name.
 */

/**
 * Get the destination chain data to perform an export.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.Auctions The Web3 contract instance.
 * @returns {Promise<OriginChainData>} The chain data.
 */
const getOriginChainData = ({ Auctions }) =>
  Promise.all([
    getAuctionStatus({ Auctions }),
    getMetChainName({ Auctions })
  ])
    .then(([
      { dailyAuctionStartTime, genesisTime },
      originChain
    ]) => ({
      dailyAuctionStartTime,
      genesisTime,
      originChain
    }))

/**
 * Get the minimum MET fee required by the TokenPorter to process a port
 * operation.
 *
 * If a fee amount is provided, it will just return that for convenience.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.TokenPorter The Web3 TokenPorter contract instance.
 * @param {string} amount The coin amount to port.
 * @param {string} [givenFee] The fee amount.
 * @returns {Promise<string>} The port fee.
 */
const getMetExportFee = ({ TokenPorter }, amount, givenFee) =>
  givenFee
    ? Promise.resolve(givenFee)
    : Promise.all([
      TokenPorter.methods.minimumExportFee().call().then(fee => toBN(fee)),
      TokenPorter.methods.exportFee().call().then(fee => toBN(fee))
    ])
      .then(([minFee, exportFee]) =>
        BN.max(minFee, exportFee.mul(toBN(amount)).divn(10000)).toString()
      )

/**
 * Get the Merkle root of a last 16 burns.
 *
 * This is the proof required to import the burned MET into another chain.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.TokenPorter The Web3 TokenPorter contract instance.
 * @param {string} burnSequence The burn sequence number.
 * @returns {Promise<string>} The Merkle root hash.
 */
const getExportProof = ({ TokenPorter }, burnSequence) =>
  Promise.all(new Array(16).fill(null)
    .map((_, i) => toBN(burnSequence).subn(i))
    .filter(seq => seq.gten(0))
    .reverse()
    .map(seq => TokenPorter.methods.exportedBurns(seq.toString()).call())
  )
    .then(calcMerkleRoot)

/**
 * Helper to estimate the gas of a given transaction or method function call.
 *
 * If a gas amount is provided, it will just return that for convenience.
 *
 * @param {Object} transaction The Web3 contract method transaction creator.
 * @param {Object} transactionObject The Web3 transaction object.
 * @param {number} [givenGas] The gas amount.
 * @returns {Promise<number>} The estimated gas.
 */
function estimateGas (transaction, transactionObject, givenGas) {
  if (givenGas) {
    debug('Using given gas %d', givenGas)
    return Promise.resolve(givenGas)
  }

  debug('Estimating transaction gas')
  return transaction.estimateGas(transactionObject)
    .then(function (gas) {
      debug('Gas estimation is %d', gas)
      return gas
    })
}

/**
 * Hook into a transaction lifecycle to log the hash/receipt events.
 *
 * @param {Object} promiEvent The result of sending a Web3 transaction.
 * @param {string} name A friendly name for logging purposes.
 */
function debugTransaction (promiEvent, name = 'Transaction') {
  promiEvent.once('transactionHash', function (transactionHash) {
    debug('%s hash %s', name, transactionHash)
  })
  promiEvent.once('receipt', function ({ transactionHash, blockNumber }) {
    debug('%s mined %s %s', name, transactionHash, blockNumber)
  })
}

/**
 * A wrapped PromiEvent object.
 * @typedef {Object<string, any>} WrappedPromiEvent
 * @property {Object} promiEvent A Web3 PromiEvent instance.
 */

/**
 * Buy MET in auction.
 *
 * @param {Object} web3 A Web3 instance.
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.Auctions The Web3 Auctions contract instance.
 * @param {Object} options The purchase Web3 transaction object.
 * @param {string} options.from The sender address.
 * @param {number} [options.gas] The gas to use.
 * @param {number} [options.nonce] The nonce.
 * @param {string} options.value The coins to send to the contract.
 * @returns {Promise<WrappedPromiEvent>} The wrapped purchase Web3 PromiEvent.
 */
function buyMet (web3, { Auctions }, options) {
  const { from, gas: givenGas, nonce, value } = options

  const contractAddress = Auctions.options.address
  const transactionObject = { from, to: contractAddress, value }
  return estimateGas(web3.eth, transactionObject, givenGas)
    .then(function (gas) {
      const promiEvent = web3.eth
        .sendTransaction({ ...transactionObject, gas, nonce })
      debugTransaction(promiEvent, 'Purchase')
      return { promiEvent }
    })
}

/**
 * Transfer MET.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.METToken The Web3 contract instance.
 * @param {Object} params The transfer params.
 * @param {string} params.to The recipient address.
 * @param {string} params.value The amount to transfer.
 * @param {Object} options The transfer Web3 transaction options.
 * @param {string} options.from The sender address.
 * @param {number} [options.gas] The gas to use.
 * @param {number} [options.nonce] The nonce.
 * @returns {Promise<WrappedPromiEvent>} The weapped transfer Web3 PromiEvent.
 */
function sendMet ({ METToken }, params, options) {
  const { to, value } = params
  const { from, gas: givenGas, nonce } = options

  const transfer = METToken.methods.transfer(to, value)
  const transactionObject = { from }
  return estimateGas(transfer, transactionObject, givenGas)
    .then(function (gas) {
      const promiEvent = transfer.send({ ...transactionObject, gas, nonce })
      debugTransaction(promiEvent, 'Transfer')
      return { promiEvent }
    })
}

/**
 * Set MET allowance.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.METToken The Web3 contract instance.
 * @param {Object} params The allowance params.
 * @param {string} params.spender The address allowed to spend tokens.
 * @param {string} params.value The amount to approve.
 * @param {Object} options The allowance Web3 transaction options.
 * @param {string} options.from The sender address.
 * @param {number} [options.gas] The gas to use.
 * @param {number} [options.nonce] The nonce.
 * @returns {Promise<WrappedPromiEvent>} The weapped allowance Web3 PromiEvent.
 */
function approveMet ({ METToken }, params, options) {
  const { spender, value } = params
  const { from, gas: givenGas, nonce } = options

  const approval = METToken.methods.approve(spender, value)
  const transactionObject = { from }
  return estimateGas(approval, transactionObject, givenGas)
    .then(function (gas) {
      const promiEvent = approval.send({ ...transactionObject, gas, nonce })
      debugTransaction(promiEvent, 'Approve')
      return { promiEvent }
    })
}

/**
 * Convert coins to MET.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.AutonomousConverter The Web3 contract instance.
 * @param {Object} params The conversion params.
 * @param {string} [params.minReturn] Will cancel conversion if minReturn tokens are not obtained.
 * @param {Object} options The conversion Web3 transaction options.
 * @param {string} options.from The sender address.
 * @param {number} [options.gas] The gas to use.
 * @param {number} [options.nonce] The nonce.
 * @param {string} options.value The coin amount to convert.
 * @returns {Promise<WrappedPromiEvent>} The weapped conversion Web3 PromiEvent.
 */
function convertCoinsToMet ({ AutonomousConverter }, params, options) {
  const { minReturn = '1' } = params
  const { from, gas: givenGas, nonce, value } = options

  const conversion = AutonomousConverter.methods.convertEthToMet(minReturn)
  const transactionObject = { from, value }
  return estimateGas(conversion, transactionObject, givenGas)
    .then(function (gas) {
      const promiEvent = conversion.send({ ...transactionObject, gas, nonce })
      debugTransaction(promiEvent, 'Convert coins')
      return { promiEvent }
    })
}

/**
 * Convert MET to coins.
 *
 * This is a low-level operation that will not check if the AutonomousConverter
 * contract is allowed to spend MET by the amount willing to be converted. If
 * enough allowance is not previosly set, the transaction will fail.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.AutonomousConverter The Web3 contract instance.
 * @param {Object} params The conversion params.
 * @param {string} params.amount The MET amount to convert.
 * @param {string} [params.minReturn='1'] Will cancel conversion if minReturn tokens are not obtained.
 * @param {Object} options The conversion Web3 transaction options.
 * @param {string} options.from The sender address.
 * @param {number} [options.gas] The gas to use.
 * @param {number} [options.nonce] The nonce.
 * @returns {Promise<WrappedPromiEvent>} The weapped conversion Web3 PromiEvent.
 */
function convertMetToCoinUncheck ({ AutonomousConverter }, params, options) {
  const { amount, minReturn = '1' } = params
  const { from, gas: givenGas, nonce } = options

  const conversion = AutonomousConverter.methods
    .convertMetToEth(amount, minReturn)
  const transactionObject = { from }
  return estimateGas(conversion, transactionObject, givenGas)
    .then(function (gas) {
      const promiEvent = conversion.send({ ...transactionObject, gas, nonce })
      debugTransaction(promiEvent, 'Convert MET')
      return { promiEvent }
    })
}

/**
 * Convert MET to coins.
 *
 * This is a high-level operation that ensure the AutonomousConverter contract
 * is allowed to spend MET by the amount willing to be converted. The operation
 * might then send 1, 2 or 3 transactions depending on the scenario and
 * therefore will return the same amount of PromiEvents.
 *
 * @param {Object} web3 A Web3 instance.
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.AutonomousConverter The Web3 contract instance.
 * @param {Object} contracts.METToken The Web3 contract instance.
 * @param {Object} params The conversion params.
 * @param {string} params.amount The MET amount to convert.
 * @param {string} [params.minReturn] Will cancel conversion if minReturn tokens are not obtained.
 * @param {Object} options The conversion Web3 transaction options.
 * @param {string} options.from The sender address.
 * @returns {Promise<WrappedPromiEvent[]>} The weapped conversion Web3 PromiEvents.
 */
function convertMetToCoins (web3, contracts, params, options) {
  const { AutonomousConverter, METToken } = contracts
  const { amount } = params
  const { from } = options
  const spender = AutonomousConverter.options.address

  return Promise.all([
    METToken.methods.allowance(from, spender).call(),
    web3.eth.getTransactionCount(from)
  ])
    .then(function ([allowance, transactionCount]) {
      let gas
      let nonce = transactionCount

      const pending = []

      if (toBN(allowance).lt(toBN(amount))) {
        if (toBN(allowance).gtn(0)) {
          // Clear allowance first
          const clearParams = { spender, value: '0' }
          const clearOptions = { from, nonce: nonce++ }
          pending.push(approveMet(contracts, clearParams, clearOptions))

          // Set gas as next transactions cannot be estimated
          gas = 250000
        }

        // Set proper allowance
        const approvalParams = { spender, value: amount }
        const approvalOptions = { from, gas, nonce: nonce++ }
        pending.push(approveMet(contracts, approvalParams, approvalOptions))

        // Set gas as next transactions cannot be estimated
        gas = 250000
      }

      const convOptions = { from, gas, nonce }
      pending.push(convertMetToCoinUncheck(contracts, params, convOptions))

      return Promise.all(pending)
    })
}

/**
 * Initiate an export of MET to another chain and obtain the burn data.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.METToken The Web3 contract instance.
 * @param {Object} contracts.TokenPorter The Web3 contract instance.
 * @param {Object} params The export params.
 * @param {string} params.amount The MET amount to burn and export.
 * @param {DestinationChainData} params.destinationData The destination chain data.
 * @param {string} [params.destRecipAddr] The recipient address. Defaults to sender.
 * @param {string} [params.extraData] Extra information.
 * @param {string} [params.fee] The export fee.
 * @param {Object} options The export Web3 transaction options.
 * @param {string} options.from The sender address.
 * @param {number} [options.gas] The gas to use.
 * @param {number} [options.nonce] The nonce.
 * @returns {Promise<WrappedPromiEvent>} The weapped export Web3 PromiEvent.
 */
function exportMet ({ METToken, TokenPorter }, params, options) {
  const {
    amount,
    destinationData: {
      destChain,
      destMetronomeAddr
    },
    destRecipAddr,
    extraData,
    fee: givenFee
  } = params
  const {
    from,
    gas: givenGas,
    nonce
  } = options
  debug('Export to %s', destChain)

  return getMetExportFee({ TokenPorter }, amount, givenFee)
    .then(function (fee) {
      debug('Export fee is %s', fee)
      const metExport = METToken.methods.export(
        toHex(destChain),
        destMetronomeAddr,
        destRecipAddr || from,
        amount,
        fee,
        toHex(extraData || '')
      )
      const transactionObject = { from }
      return estimateGas(metExport, transactionObject, givenGas)
        .then(function (gas) {
          const promiEvent = metExport.send({
            ...transactionObject,
            gas,
            nonce
          })
          debugTransaction(promiEvent, 'Export MET')
          return { promiEvent }
        })
    })
}

/**
 * Request the import of MET burned on another chain.
 *
 * This operation will log events the validators will listen in order to
 * complete the import process by signaling the METToken contract to mint and
 * transfer the tokens.
 *
 * @param {Object} contracts The Metronome contracts.
 * @param {Object} contracts.METToken The Web3 contract instance.
 * @param {Object} params The import params.
 * @param {Object} params.exportData The data obtained when the tokens were exported.
 * @param {OriginChainData} params.originData The origin chain data.
 * @param {string} params.proof The burn proof on the origin chain.
 * @param {Object} options The export Web3 transaction options.
 * @param {string} options.from The sender address.
 * @param {number} [options.gas] The gas to use.
 * @param {number} [options.nonce] The nonce.
 * @returns {Promise<WrappedPromiEvent>} The weapped export Web3 PromiEvent.
 */
function importMet ({ METToken }, params, options) {
  const {
    exportData: {
      amountToBurn,
      blockTimestamp,
      burnSequence,
      currentBurnHash,
      currentTick,
      dailyMintable,
      destinationChain,
      destinationMetronomeAddr,
      destinationRecipientAddr,
      extraData,
      fee,
      prevBurnHash,
      supplyOnAllChains
    },
    originData: {
      dailyAuctionStartTime,
      genesisTime,
      originChain
    },
    proof
  } = params
  const {
    from,
    gas: givenGas,
    nonce
  } = options
  debug('Import %s from %s', currentBurnHash, originChain)

  const metImport = METToken.methods.importMET(
    toHex(originChain),
    toHex(destinationChain),
    [destinationMetronomeAddr, destinationRecipientAddr],
    extraData,
    [prevBurnHash, currentBurnHash],
    supplyOnAllChains,
    [
      blockTimestamp,
      amountToBurn,
      fee,
      currentTick,
      toSec(genesisTime),
      dailyMintable,
      burnSequence,
      toSec(dailyAuctionStartTime)
    ],
    proof
  )
  const transactionObject = { from }
  return estimateGas(metImport, transactionObject, givenGas)
    .then(function (gas) {
      const promiEvent = metImport.send({
        ...transactionObject,
        gas,
        nonce
      })
      debugTransaction(promiEvent, 'Import MET')
      return { promiEvent }
    })
}

module.exports = {
  approveMet,
  buyMet,
  convertCoinsToMet,
  convertMetToCoins,
  exportMet,
  getAuctionStatus,
  getCoinsToMetResult,
  getConverterStatus,
  getDestinationChainData,
  getExportProof,
  getMetBalance,
  getMetChainName,
  getMetExportFee,
  getMetToCoinsResult,
  getOriginChainData,
  importMet,
  sendMet
}
