/* global describe, it, before */

import {expect} from 'chai'

import {clearDb, redis} from '../helper'
import {CheckingAccountRepository} from '../../../../src/repository/checking-account'
import Promise from 'bluebird'
import {ModelEvent} from '@rheactorjs/event-store'

describe('CheckingAccountRepository', () => {
  before(clearDb)

  let checkingAccountRepo

  before(() => {
    checkingAccountRepo = new CheckingAccountRepository(redis)
  })

  it('should persist', (done) => {
    Promise
      .join(
        checkingAccountRepo.add({name: 'CheckingAccount 1'}),
        checkingAccountRepo.add({name: 'CheckingAccount 2'})
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
            expect(+a1.meta.id).to.be.above(0)
            expect(a1.name).to.equal('CheckingAccount 1')
            expect(+a2.meta.id).to.be.above(0)
            expect(a2.name).to.equal('CheckingAccount 2')
            done()
          })
      })
  })
})
