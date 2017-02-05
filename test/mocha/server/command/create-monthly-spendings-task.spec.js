/* global describe, it, after */

import CreateMonthlySpendingsCommand from '../../../../server/command/create-monthly-spendings'

import {PeriodicalRepository} from '../../../../server/repository/periodical'
import {SpendingRepository} from '../../../../server/repository/spending'
import {PeriodicalModel} from '../../../../server/model/periodical'
import Promise from 'bluebird'
import simple from 'simple-mock'
simple.Promise = Promise
import {expect} from 'chai'

describe('CreateMonthlySpendingsCommand', () => {
  let task
  let mockPeriodicalRepository
  let mockSpendingRepository

  let periodical1 = new PeriodicalModel(
    '42',
    '17',
    'Salary',
    'Tanja\'s Salary',
    165432,
    false,
    new Date('2015-01-01').getTime()
  )

  let periodical2 = new PeriodicalModel(
    '42',
    '17',
    'Salary',
    'Markus\'s Salary',
    123456,
    false,
    new Date('2015-01-02').getTime()
  )

  after(() => {
    simple.restore()
  })

  it('should create spendings for the given month', done => {
    let periodicals = [periodical1, periodical2]
    mockPeriodicalRepository = new PeriodicalRepository()
    simple.mock(mockPeriodicalRepository, 'findByMonth').resolveWith(periodicals)
    mockSpendingRepository = new SpendingRepository()
    simple.mock(mockSpendingRepository, 'add').resolveWith(null)
    let month = new Date()
    task = new CreateMonthlySpendingsCommand(mockPeriodicalRepository, mockSpendingRepository)
    task.execute(month.getTime()).then(() => {
      expect(mockPeriodicalRepository.findByMonth.callCount).to.equal(1)
      expect(mockPeriodicalRepository.findByMonth.lastCall.arg).to.equal(month.getTime())
      expect(mockSpendingRepository.add.callCount).to.equal(periodicals.length)
      done()
    })
  })
})
