'use strict'

const SpendingModel = require('../model/spending')

/**
 * @param {PeriodicalRepository} periodicalsRepository
 * @param {SpendingRepository} spendingsRepository
 * @constructor
 */
const CreateMonthlySpendingsCommand = function (periodicalsRepository, spendingsRepository) {
  this.periodicalsRepository = periodicalsRepository
  this.spendingsRepository = spendingsRepository
}

/**
 * @param {Number} month
 * @returns {Promise.<Array.<ModelEvent>>}
 */
CreateMonthlySpendingsCommand.prototype.execute = function (month) {
  let self = this
  // Find the periodicals for the given month
  return self.periodicalsRepository
    .findByMonth(month)
    .map((periodical) => {
      let spending = SpendingModel.fromPeriodical(periodical, month)
      return self.spendingsRepository.add(spending)
    })
}

module.exports = CreateMonthlySpendingsCommand
