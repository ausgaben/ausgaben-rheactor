import UpdateCheckingAccountPropertyCommand from '../../../command/checking-account/update-property'

export default {
  command: UpdateCheckingAccountPropertyCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {SpendingRepository} repository
   * @param {UpdateCheckingAccountPropertyCommand} cmd
   * @return {Promise.<SpendingUpdatedEvent>}
   */
  handler: (emitter, repository, cmd) => {
    let event
    switch (cmd.property) {
      case 'monthly':
        event = cmd.checkingAccount.setMonthly(cmd.value)
        break
      case 'savings':
        event = cmd.checkingAccount.setSavings(cmd.value)
        break
    }
    return repository.persistEvent(event, cmd.author)
  }
}
