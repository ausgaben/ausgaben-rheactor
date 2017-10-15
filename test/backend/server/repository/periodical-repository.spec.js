/* global describe expect, it, beforeAll */

import {clearDb, redis} from '../helper'
import {PeriodicalRepository} from '../../../../src/repository/periodical'
import Promise from 'bluebird'
import {ModelEvent} from '@rheactorjs/event-store'

describe('PeriodicalRepository', () => {
  beforeAll(clearDb)

  let periodicalRepo

  beforeAll(() => {
    periodicalRepo = new PeriodicalRepository(redis)
  })

  it('should persist', (done) => {
    let periodical1 = {
      checkingAccount: '42',
      author: '17',
      category: 'Salary',
      title: 'Tanja\'s Salary',
      amount: 165432,
      estimate: false,
      startsAt: new Date('2015-01-01')
    }
    let periodical2 = {
      checkingAccount: '42',
      author: '17',
      category: 'Salary',
      title: 'Markus\'s Salary',
      amount: 123456,
      estimate: false,
      startsAt: new Date('2015-01-02')
    }
    Promise
      .join(
        periodicalRepo.add(periodical1),
        periodicalRepo.add(periodical2)
      )
      .spread((event1, event2) => {
        expect(event1).toBeInstanceOf(ModelEvent)
        expect(event2).toBeInstanceOf(ModelEvent)
        return Promise
          .join(
            periodicalRepo.getById(event1.aggregateId),
            periodicalRepo.getById(event2.aggregateId)
          )
          .spread((p1, p2) => {
            expect(+p1.meta.id).toBeGreaterThan(0)
            expect(p1.checkingAccount).toEqual('42')
            expect(p1.author).toEqual('17')
            expect(p1.category).toEqual('Salary')
            expect(p1.title).toEqual('Tanja\'s Salary')
            expect(p1.amount).toEqual(165432)
            expect(p1.startsAt.getTime()).toEqual(new Date('2015-01-01').getTime())
            expect(p1.estimate).toEqual(false)
            expect(p1.enabledIn).toEqual(4095)
            expect(+p2.meta.id).toBeGreaterThan(0)
            expect(p2.checkingAccount).toEqual('42')
            expect(p2.author).toEqual('17')
            expect(p2.category).toEqual('Salary')
            expect(p2.title).toEqual('Markus\'s Salary')
            expect(p2.amount).toEqual(123456)
            expect(p2.startsAt.getTime()).toEqual(new Date('2015-01-02').getTime())
            expect(p2.estimate).toEqual(false)
            expect(p2.enabledIn).toEqual(4095)
            done()
          })
      })
  })

  it('should find periodicals by month', (done) => {
    periodicalRepo.findByMonth(new Date('2015-01-02')).then((periodicals) => {
      expect(periodicals.length).toEqual(2)
      done()
    })
  })
})
