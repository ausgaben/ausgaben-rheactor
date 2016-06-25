'use strict'

/* global describe, it, before */

const expect = require('chai').expect
const helper = require('../helper')
const AccountRepository = require('../../../../server/repository/account')
const AccountModel = require('../../../../server/model/account')
const Promise = require('bluebird')
const ModelEvent = require('rheactor-event-store/model-event')

describe('AccountRepository', () => {
  before(helper.clearDb)

  let accountRepo

  before(() => {
    accountRepo = new AccountRepository(helper.redis)
  })

  it('should persist', (done) => {
    let account1 = new AccountModel('Account 1')
    let account2 = new AccountModel('Account 2')
    Promise
      .join(
        accountRepo.add(account1),
        accountRepo.add(account2)
      )
      .spread((event1, event2) => {
        expect(event1).to.be.instanceof(ModelEvent)
        expect(event2).to.be.instanceof(ModelEvent)
        return Promise
          .join(
            accountRepo.getById(event1.aggregateId),
            accountRepo.getById(event2.aggregateId)
          )
          .spread((a1, a2) => {
            expect(a1.aggregateId()).to.be.above(0)
            expect(a1.name).to.equal('Account 1')
            expect(a2.aggregateId()).to.be.above(0)
            expect(a2.name).to.equal('Account 2')
            done()
          })
      })
  })
})
