import {SpendingModel} from '../model/spending'

/**
 * @param {PeriodicalRepository} periodicalsRepository
 * @param {SpendingRepository} spendingsRepository
 * @constructor
 */
class CreateMonthlySpendingsCommand {
  constructor (periodicalsRepository, spendingsRepository) {
    this.periodicalsRepository = periodicalsRepository
    this.spendingsRepository = spendingsRepository
  }

  /**
   * @param {Number} month
   * @returns {Promise.<Array.<ModelEvent>>}
   */
  execute (month) {
    let self = this
    // Find the periodicals for the given month
    return self.periodicalsRepository
      .findByMonth(month)
      .map((periodical) => {
        let spending = SpendingModel.fromPeriodical(periodical, month)
        return self.spendingsRepository.add(spending)
      })
  }
}

export default CreateMonthlySpendingsCommand
