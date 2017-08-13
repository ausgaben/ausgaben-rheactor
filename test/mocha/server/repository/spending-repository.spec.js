/* global describe, it, before */

import {expect} from 'chai'

import {clearDb, redis} from '../helper'
import {SpendingRepository} from '../../../../src/repository/spending'
import Promise from 'bluebird'
import {ModelEvent} from '@rheactorjs/event-store'

describe('SpendingRepository', () => {
  before(clearDb)

  let spendingRepo

  before(() => {
    spendingRepo = new SpendingRepository(redis)
  })

  it('should persist', (done) => {
    Promise
      .join(
        spendingRepo.add({
          checkingAccount: '42', author: '17', category: 'Salary', title: 'Tanja\'s Salary', amount: 165432, booked: true, bookedAt: new Date('2015-01-01')
        }),
        spendingRepo.add({
          checkingAccount: '42', author: '17', category: 'Salary', title: 'Markus\'s Salary', amount: 123456, booked: true, bookedAt: new Date('2015-01-02')
        })
      )
      .spread((event1, event2) => {
        expect(event1).to.be.instanceof(ModelEvent)
        expect(event2).to.be.instanceof(ModelEvent)
        return Promise
          .join(
            spendingRepo.getById(event1.aggregateId),
            spendingRepo.getById(event2.aggregateId)
          )
          .spread((s1, s2) => {
            expect(+s1.meta.id).to.be.above(0)
            expect(s1.checkingAccount).to.equal('42')
            expect(s1.author).to.equal('17')
            expect(s1.category).to.equal('Salary')
            expect(s1.title).to.equal('Tanja\'s Salary')
            expect(s1.amount).to.equal(165432)
            expect(s1.bookedAt.getTime()).to.equal(new Date('2015-01-01').getTime())
            expect(s1.booked).to.equal(true)
            expect(+s2.meta.id).to.be.above(0)
            expect(s2.checkingAccount).to.equal('42')
            expect(s2.author).to.equal('17')
            expect(s2.category).to.equal('Salary')
            expect(s2.title).to.equal('Markus\'s Salary')
            expect(s2.amount).to.equal(123456)
            expect(s2.bookedAt.getTime()).to.equal(new Date('2015-01-02').getTime())
            expect(s2.booked).to.equal(true)
            done()
          })
      })
  })
})
