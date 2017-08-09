import CreateCheckingAccountUserCommand from '../../../command/checking-account-user/create'
import {CheckingAccountUserModel} from '../../../model/checking-account-user'

export default {
  command: CreateCheckingAccountUserCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {CheckingAccountUserRepository} repository
   * @param {CreateCheckingAccountUserCommand} cmd
   * @return {Promise.<CheckingAccountUserCreatedEvent>}
   */
  handler: (emitter, repository, cmd) => {
    let checkingAccountUser = new CheckingAccountUserModel(cmd.checkingAccount.meta.id, cmd.user.meta.id)
    return repository.add(checkingAccountUser)
  }
}
