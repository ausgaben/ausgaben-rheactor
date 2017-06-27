import CreateSpendingCommand from '../../../command/spending/create'
import {SpendingModel} from '../../../model/spending'

export default {
  command: CreateSpendingCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {SpendingRepository} repository
   * @param {CreateSpendingCommand} cmd
   * @return {Promise.<SpendingUpdatedEvent>}
   */
  handler: (emitter, repository, cmd) => {
    let spending = new SpendingModel(cmd.checkingAccount.aggregateId(), cmd.author.aggregateId(), cmd.category, cmd.title, cmd.amount, cmd.booked, cmd.bookedAt, cmd.saving)
    return repository.add(spending)
  }
}
