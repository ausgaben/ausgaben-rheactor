'use strict'

const DeleteSpendingCommand = require('../../../command/spending/delete')

module.exports = {
  command: DeleteSpendingCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {SpendingRepository} repository
   * @param {DeleteSpendingCommand} cmd
   * @return {Promise.<SpendingUpdatedEvent>}
   */
  handler: (emitter, repository, cmd) => repository.remove(cmd.spending, cmd.author)
}
