'use strict'

const CreateSpendingCommand = require('../../../command/spending/create')
const SpendingModel = require('../../../model/spending')

module.exports = {
  command: CreateSpendingCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {SpendingRepository} repository
   * @param {CreateSpendingCommand} cmd
   * @return {Promise.<SpendingCreatedEvent>}
   */
  handler: (emitter, repository, cmd) => {
    let spending = new SpendingModel(cmd.checkingAccount.aggregateId(), cmd.author.aggregateId(), cmd.type, cmd.category, cmd.title, cmd.amount, cmd.booked, cmd.bookedAt)
    return repository.add(spending)
  }
}
