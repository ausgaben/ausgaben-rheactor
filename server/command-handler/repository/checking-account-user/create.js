'use strict'

const CreateCheckingAccountUserCommand = require('../../../command/checking-account-user/create')
const CheckingAccountUserModel = require('../../../model/checking-account-user')

module.exports = {
  command: CreateCheckingAccountUserCommand,
  /**
   * @param {BackendEmitter} emitter
   * @param {CheckingAccountUserRepository} repository
   * @param {CreateCheckingAccountUserCommand} cmd
   * @return {Promise.<CheckingAccountUserCreatedEvent>}
   */
  handler: (emitter, repository, cmd) => {
    let checkingAccountUser = new CheckingAccountUserModel(cmd.checkingAccount.aggregateId(), cmd.user.aggregateId())
    return repository.add(checkingAccountUser)
  }
}
