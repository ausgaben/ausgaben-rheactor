'use strict'

const moment = require('moment')
const forIn = require('lodash/forIn')

module.exports = {
  arguments: '<account> <year>',
  description: 'create a simple report',
  action: (backend, account, year) => {
    const report = {}
    return backend.repositories.checkingAccount.getById(account)
      .then(account => backend.repositories.spending.findByCheckingAccountId(account.aggregateId()))
      .filter(spending => spending.booked)
      .filter(spending => moment(new Date(spending.bookedAt)).isBetween((+year - 1) + '-12-31', (+year + 1) + '-01-01', 'day'))
      .map(spending => {
        if (report[spending.category] === undefined) {
          report[spending.category] = 0
        }
        report[spending.category] += spending.amount
      })
      .then(() => {
        forIn(report, (v, k) => {
          console.log(`${k}\t${v}`)
        })
      })
  }
}
