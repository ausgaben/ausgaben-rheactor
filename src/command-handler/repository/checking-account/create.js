import CreateCheckingAccountCommand from '../../../command/checking-account/create'
import CreateCheckingAccountUserCommand from '../../../command/checking-account-user/create'

export default {
  command: CreateCheckingAccountCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {CheckingAccountRepository} repository
   * @param {CreateCheckingAccountCommand} cmd
   * @return {Promise.<CheckingAccountCreatedEvent>}
   */
  handler: (emitter, repository, cmd) => repository.add(cmd)
    .then((event) => repository.getById(event.aggregateId)
      .then(checkingAccount => {
        emitter.emit(new CreateCheckingAccountUserCommand(checkingAccount, cmd.author))
        return event
      })
    )
}
