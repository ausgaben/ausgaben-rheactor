/* global describe, it, after */

import CreateMonthlySpendingsCommand from '../../../../src/command/create-monthly-spendings'
import {PeriodicalRepository} from '../../../../src/repository/periodical'
import {SpendingRepository} from '../../../../src/repository/spending'
import {PeriodicalModel} from '../../../../src/model/periodical'
import Promise from 'bluebird'
import simple from 'simple-mock'
import {expect} from 'chai'
import {AggregateMeta} from '@rheactorjs/event-store'

simple.Promise = Promise

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
    new Date('2015-01-01'),
    undefined,
    false,
    new AggregateMeta(1, 1)
  )

  let periodical2 = new PeriodicalModel(
    '42',
    '17',
    'Salary',
    'Markus\'s Salary',
    123456,
    false,
    new Date('2015-01-02'),
    undefined,
    false,
    new AggregateMeta(1, 1)
  )

  after(() => {
    simple.restore()
  })

  it('should create spendings for the given month', done => {
    let periodicals = [periodical1, periodical2]
    mockPeriodicalRepository = new PeriodicalRepository({})
    simple.mock(mockPeriodicalRepository, 'findByMonth').resolveWith(periodicals)
    mockSpendingRepository = new SpendingRepository({})
    simple.mock(mockSpendingRepository, 'add').resolveWith(null)
    let month = new Date()
    task = new CreateMonthlySpendingsCommand(mockPeriodicalRepository, mockSpendingRepository)
    task.execute(month).then(() => {
      expect(mockPeriodicalRepository.findByMonth.callCount).to.equal(1)
      expect(mockPeriodicalRepository.findByMonth.lastCall.arg.getTime()).to.equal(month.getTime())
      expect(mockSpendingRepository.add.callCount).to.equal(periodicals.length)
      done()
    })
  })
})
