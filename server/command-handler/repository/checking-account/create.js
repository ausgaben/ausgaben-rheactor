import CreateCheckingAccountCommand from '../../../command/checking-account/create'
import CreateCheckingAccountUserCommand from '../../../command/checking-account-user/create'
import {CheckingAccountModel} from '../../../model/checking-account'

export default {
  command: CreateCheckingAccountCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {CheckingAccountRepository} repository
   * @param {CreateCheckingAccountCommand} cmd
   * @return {Promise.<CheckingAccountCreatedEvent>}
   */
  handler: (emitter, repository, cmd) => {
    let checkingAccount = new CheckingAccountModel(cmd.name, cmd.monthly, cmd.savings)
    return repository.add(checkingAccount)
      .then((event) => {
        emitter.emit(new CreateCheckingAccountUserCommand(checkingAccount, cmd.author))
        return event
      })
  }
}
