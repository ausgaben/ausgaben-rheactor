'use strict'

const Promise = require('bluebird')
const CreateCheckingAccountUserCommand = require('../command/checking-account-user/create')
const EmailValue = require('rheactor-value-objects/email')

module.exports = {
  description: 'manage the users for an account',
  arguments: '<account>', options: [
    ['-a, --add <email>', 'Add user to account']
  ],
  action: (backend, accountId, options) => {
    if (options.add) {
      return Promise
        .join(backend.repositories.checkingAccount.getById(accountId),
          backend.repositories.user.findByEmail(new EmailValue(options.add || options.remove))
        )
        .spread((user, account) => {
          console.log(`Adding ${user.email} to ${account.name} …`)
          return backend.emitter.emit(new CreateCheckingAccountUserCommand(account, user))
        })
    } else {
      return Promise
        .join(
          backend.repositories.checkingAccount.getById(accountId),
          backend.repositories.checkingAccountUser.findByCheckingAccountId(accountId)
            .then(result => {
              console.log(result)
              return result
            })
            .map(({user}) => backend.repositories.user.getById(user))
        )
        .spread((account, members) => {
          console.log(account.name)
          members.map(member => {
            console.log(`- ${member.name()}`)
          })
        })
    }
  }
}
