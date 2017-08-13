import CreateCheckingAccountUserCommand from '../../../command/checking-account-user/create'

export default {
  command: CreateCheckingAccountUserCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {CheckingAccountUserRepository} repository
   * @param {CreateCheckingAccountUserCommand} cmd
   * @return {Promise.<CheckingAccountUserCreatedEvent>}
   */
  handler: (emitter, repository, cmd) => repository.add(cmd.checkingAccount.meta.id, cmd.user.meta.id)
}
