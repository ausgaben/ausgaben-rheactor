'use strict'

const CreateCheckingAccountCommand = require('../../../command/checking-account/create')
const CreateCheckingAccountUserCommand = require('../../../command/checking-account-user/create')
const CheckingAccountModel = require('../../../model/checking-account')

module.exports = {
  command: CreateCheckingAccountCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {CheckingAccountRepository} repository
   * @param {CreateCheckingAccountCommand} cmd
   * @return {Promise.<CheckingAccountCreatedEvent>}
   */
  handler: (emitter, repository, cmd) => {
    let checkingAccount = new CheckingAccountModel(cmd.name, cmd.monthly)
    return repository.add(checkingAccount)
      .then((event) => {
        emitter.emit(new CreateCheckingAccountUserCommand(checkingAccount, cmd.author))
        return event
      })
  }
}
