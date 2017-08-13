import CreateSpendingCommand from '../../../command/spending/create'

export default {
  command: CreateSpendingCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {SpendingRepository} repository
   * @param {CreateSpendingCommand} cmd
   * @return {Promise.<SpendingUpdatedEvent>}
   */
  handler: (emitter, repository, cmd) => repository.add({
    checkingAccount: cmd.checkingAccount.meta.id,
    author: cmd.author.meta.id,
    category: cmd.category,
    title: cmd.title,
    amount: cmd.amount,
    booked: cmd.booked,
    bookedAt: cmd.bookedAt,
    saving: cmd.saving
  })
}
