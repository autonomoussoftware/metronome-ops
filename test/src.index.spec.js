'use strict'

const sinon = require('sinon')
require('chai').should()

const metOps = require('..')

describe('Metronome operations', function () {
  it('should have all basic operations', function () {
    metOps.should.have.property('getAuctionStatus').that.is.a('function')
    metOps.should.have.property('getConverterStatus').that.is.a('function')

    metOps.should.have.property('buyMet').that.is.a('function')
    metOps.should.have.property('getMetBalance').that.is.a('function')
    metOps.should.have.property('sendMet').that.is.a('function')
    metOps.should.have.property('approveMet').that.is.a('function')

    metOps.should.have.property('getCoinsToMetResult').that.is.a('function')
    metOps.should.have.property('getMetToCoinsResult').that.is.a('function')
    metOps.should.have.property('convertCoinsToMet').that.is.a('function')
    metOps.should.have.property('convertMetToCoins').that.is.a('function')

    metOps.should.have.property('getMetChainName').that.is.a('function')
    metOps.should.have.property('getDestinationChainData').that.is.a('function')
    metOps.should.have.property('getMetExportFee').that.is.a('function')
    metOps.should.have.property('exportMet').that.is.a('function')
    metOps.should.have.property('getExportProof').that.is.a('function')

    metOps.should.have.property('getOriginChainData').that.is.a('function')
    metOps.should.have.property('importMet').that.is.a('function')
  })

  it('should get export fee', function () {
    const TokenPorter = {
      methods: {
        exportFee: () => ({ call: () => Promise.resolve('1000') }),
        minimumExportFee: () => ({ call: () => Promise.resolve('1000') })
      }
    }
    return metOps.getMetExportFee({ TokenPorter }, '20000')
      .then(function (fee) {
        fee.should.be.a('string').that.equals('2000')
      })
  })

  it('should get the min export fee', function () {
    const TokenPorter = {
      methods: {
        exportFee: () => ({ call: () => Promise.resolve('1000') }),
        minimumExportFee: () => ({ call: () => Promise.resolve('1000') })
      }
    }
    return metOps.getMetExportFee({ TokenPorter }, '2000')
      .then(function (fee) {
        fee.should.be.a('string').that.equals('1000')
      })
  })

  it('should get export proof for the initial burns', function () {
    const TokenPorter = {
      methods: {
        exportedBurns: sinon.stub().returns({
          call: () => Promise.resolve(
            '0x0000000000000000000000000000000000000000000000000000000000000000'
          )
        })
      }
    }
    return metOps.getExportProof({ TokenPorter }, '4')
      .then(function (proof) {
        proof.should.be.a('string').that.match(/^0x[0-9a-f]{64}$/)
        const sequences = new Array(5)
          .fill(null)
          .map((_, i) => i)
          .map(s => [s.toString()])
        TokenPorter.methods.exportedBurns.args.should.deep.equals(sequences)
      })
  })

  it('should get export proof for the large burns', function () {
    const TokenPorter = {
      methods: {
        exportedBurns: sinon.stub().returns({
          call: () => Promise.resolve(
            '0x0000000000000000000000000000000000000000000000000000000000000000'
          )
        })
      }
    }
    return metOps.getExportProof({ TokenPorter }, '20')
      .then(function (proof) {
        proof.should.be.a('string').that.match(/^0x[0-9a-f]{64}$/)
        const sequences = new Array(16)
          .fill(null)
          .map((_, i) => i + 5)
          .map(s => [s.toString()])
        TokenPorter.methods.exportedBurns.args.should.deep.equals(sequences)
      })
  })

  it('should clear, set allowance and convert MET to coins', function () {
    const web3 = {
      eth: {
        getTransactionCount: () => Promise.resolve()
      }
    }
    const contracts = {
      AutonomousConverter: {
        options: { address: '0x0000000000000000000000000000000000000000' },
        methods: {
          convertMetToEth: () => ({
            send: () => ({ once: () => undefined })
          })
        }
      },
      METToken: {
        methods: {
          allowance: () => ({ call: () => Promise.resolve('1000') }),
          approve: () => ({
            estimateGas: () => Promise.resolve(0),
            send: () => ({ once: () => undefined })
          })
        }
      }
    }
    const params = { amount: '1000000000' }
    const options = { from: '0x0000000000000000000000000000000000000000' }
    return metOps.convertMetToCoins(web3, contracts, params, options)
      .then(function (promiEvents) {
        promiEvents.should.be.an('array').that.has.lengthOf(3)
      })
  })

  it('should set new allowance and convert MET to coins', function () {
    const web3 = {
      eth: {
        getTransactionCount: () => Promise.resolve()
      }
    }
    const contracts = {
      AutonomousConverter: {
        options: { address: '0x0000000000000000000000000000000000000000' },
        methods: {
          convertMetToEth: () => ({
            send: () => ({ once: () => undefined })
          })
        }
      },
      METToken: {
        methods: {
          allowance: () => ({ call: () => Promise.resolve('0') }),
          approve: () => ({
            estimateGas: () => Promise.resolve(0),
            send: () => ({ once: () => undefined })
          })
        }
      }
    }
    const params = { amount: '1000000000' }
    const options = { from: '0x0000000000000000000000000000000000000000' }
    return metOps.convertMetToCoins(web3, contracts, params, options)
      .then(function (promiEvents) {
        promiEvents.should.be.an('array').that.has.lengthOf(2)
      })
  })

  it('should use set allowance and convert MET to coins', function () {
    const web3 = {
      eth: {
        getTransactionCount: () => Promise.resolve()
      }
    }
    const contracts = {
      AutonomousConverter: {
        options: { address: '0x0000000000000000000000000000000000000000' },
        methods: {
          convertMetToEth: () => ({
            estimateGas: () => Promise.resolve(0),
            send: () => ({ once: () => undefined })
          })
        }
      },
      METToken: {
        methods: {
          allowance: () => ({ call: () => Promise.resolve('1000000000') })
        }
      }
    }
    const params = { amount: '1000000000' }
    const options = { from: '0x0000000000000000000000000000000000000000' }
    return metOps.convertMetToCoins(web3, contracts, params, options)
      .then(function (promiEvents) {
        promiEvents.should.be.an('array').that.has.lengthOf(1)
      })
  })
})
