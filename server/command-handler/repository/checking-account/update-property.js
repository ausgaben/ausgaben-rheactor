'use strict'

const UpdateCheckingAccountPropertyCommand = require('../../../command/checking-account/update-property')

module.exports = {
  command: UpdateCheckingAccountPropertyCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {SpendingRepository} repository
   * @param {UpdateCheckingAccountPropertyCommand} cmd
   * @return {Promise.<SpendingUpdatedEvent>}
   */
  handler: (emitter, repository, cmd) => {
    const event = cmd.checkingAccount.setMonthly(cmd.value)
    return repository.persistEvent(event, cmd.author)
  }
}
