'use strict'

/* global describe, it, before */

const expect = require('chai').expect
const helper = require('../helper')
const CheckingAccountRepository = require('../../../../server/repository/checking-account')
const CheckingAccountModel = require('../../../../server/model/checking-account')
const Promise = require('bluebird')
const ModelEvent = require('rheactor-event-store/model-event')

describe('CheckingAccountRepository', () => {
  before(helper.clearDb)

  let checkingAccountRepo

  before(() => {
    checkingAccountRepo = new CheckingAccountRepository(helper.redis)
  })

  it('should persist', (done) => {
    let checkingAccount1 = new CheckingAccountModel('CheckingAccount 1')
    let checkingAccount2 = new CheckingAccountModel('CheckingAccount 2')
    Promise
      .join(
        checkingAccountRepo.add(checkingAccount1),
        checkingAccountRepo.add(checkingAccount2)
      )
      .spread((event1, event2) => {
        expect(event1).to.be.instanceof(ModelEvent)
        expect(event2).to.be.instanceof(ModelEvent)
        return Promise
          .join(
            checkingAccountRepo.getById(event1.aggregateId),
            checkingAccountRepo.getById(event2.aggregateId)
          )
          .spread((a1, a2) => {
            expect(a1.aggregateId()).to.be.above(0)
            expect(a1.name).to.equal('CheckingAccount 1')
            expect(a2.aggregateId()).to.be.above(0)
            expect(a2.name).to.equal('CheckingAccount 2')
            done()
          })
      })
  })
})
