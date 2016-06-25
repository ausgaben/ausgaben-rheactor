'use strict'

/* global describe, it, after */

const CreateMonthlySpendingsCommand = require('../../../../server/command/create-monthly-spendings')
const PeriodicalsRepository = require('../../../../server/repository/periodical')
const SpendingsRepository = require('../../../../server/repository/spending')
const PeriodicalModel = require('../../../../server/model/periodical')
const SpendingTypeValue = require('../../../../server/valueobject/spending-type')
const Promise = require('bluebird')
const simple = require('simple-mock')
simple.Promise = Promise
const expect = require('chai').expect

describe('CreateMonthlySpendingsCommand', function () {
  let task
  let mockPeriodicalsRepository, mockSpendingsRepository

  let periodical1 = new PeriodicalModel(
    '42',
    '17',
    new SpendingTypeValue(SpendingTypeValue.INCOME),
    'Salary',
    'Tanja\'s Salary',
    165432,
    false,
    new Date('2015-01-01').getTime()
  )

  let periodical2 = new PeriodicalModel(
    '42',
    '17',
    new SpendingTypeValue(SpendingTypeValue.INCOME),
    'Salary',
    'Markus\'s Salary',
    123456,
    false,
    new Date('2015-01-02').getTime()
  )

  after(function () {
    simple.restore()
  })

  it('should create spendings for the given month', function (done) {
    let periodicals = [periodical1, periodical2]
    mockPeriodicalsRepository = new PeriodicalsRepository()
    simple.mock(mockPeriodicalsRepository, 'findByMonth').resolveWith(periodicals)
    mockSpendingsRepository = new SpendingsRepository()
    simple.mock(mockSpendingsRepository, 'add').resolveWith(null)
    let month = new Date()
    task = new CreateMonthlySpendingsCommand(mockPeriodicalsRepository, mockSpendingsRepository)
    task.execute(month.getTime()).then(() => {
      expect(mockPeriodicalsRepository.findByMonth.callCount).to.equal(1)
      expect(mockPeriodicalsRepository.findByMonth.lastCall.arg).to.equal(month.getTime())
      expect(mockSpendingsRepository.add.callCount).to.equal(periodicals.length)
      done()
    })
  })
})
