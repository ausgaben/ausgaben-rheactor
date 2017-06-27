/* global describe, it, before */

import {expect} from 'chai'

import {clearDb, redis} from '../helper'
import {PeriodicalRepository} from '../../../../server/repository/periodical'
import {PeriodicalModel} from '../../../../server/model/periodical'
import Promise from 'bluebird'
import {ModelEvent} from '@rheactorjs/event-store'

describe('PeriodicalRepository', () => {
  before(clearDb)

  let periodicalRepo

  before(() => {
    periodicalRepo = new PeriodicalRepository(redis)
  })

  it('should persist', (done) => {
    let periodical1 = new PeriodicalModel('42', '17', 'Salary', 'Tanja\'s Salary', 165432, false, new Date('2015-01-01'))
    let periodical2 = new PeriodicalModel('42', '17', 'Salary', 'Markus\'s Salary', 123456, false, new Date('2015-01-02'))
    Promise
      .join(
        periodicalRepo.add(periodical1),
        periodicalRepo.add(periodical2)
      )
      .spread((event1, event2) => {
        expect(event1).to.be.instanceof(ModelEvent)
        expect(event2).to.be.instanceof(ModelEvent)
        return Promise
          .join(
            periodicalRepo.getById(event1.aggregateId),
            periodicalRepo.getById(event2.aggregateId)
          )
          .spread((p1, p2) => {
            expect(p1.aggregateId()).to.be.above(0)
            expect(p1.checkingAccount).to.equal('42')
            expect(p1.author).to.equal('17')
            expect(p1.category).to.equal('Salary')
            expect(p1.title).to.equal('Tanja\'s Salary')
            expect(p1.amount).to.equal(165432)
            expect(p1.startsAt.getTime()).to.equal(new Date('2015-01-01').getTime())
            expect(p1.estimate).to.equal(false)
            expect(p1.enabledIn).to.equal(4095)
            expect(p2.aggregateId()).to.be.above(0)
            expect(p2.checkingAccount).to.equal('42')
            expect(p2.author).to.equal('17')
            expect(p2.category).to.equal('Salary')
            expect(p2.title).to.equal('Markus\'s Salary')
            expect(p2.amount).to.equal(123456)
            expect(p2.startsAt.getTime()).to.equal(new Date('2015-01-02').getTime())
            expect(p2.estimate).to.equal(false)
            expect(p2.enabledIn).to.equal(4095)
            done()
          })
      })
  })

  it('should find periodicals by month', (done) => {
    periodicalRepo.findByMonth(new Date('2015-01-02')).then((periodicals) => {
      expect(periodicals.length).to.equal(2)
      done()
    })
  })
})
