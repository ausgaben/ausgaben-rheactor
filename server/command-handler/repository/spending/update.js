'use strict'

const UpdateSpendingCommand = require('../../../command/spending/update')

module.exports = {
  command: UpdateSpendingCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {SpendingRepository} repository
   * @param {UpdateSpendingCommand} cmd
   * @return {Promise.<SpendingUpdatedEvent>}
   */
  handler: (emitter, repository, cmd) => repository.persistEvent(cmd.spending.update(cmd), cmd.author)
}
