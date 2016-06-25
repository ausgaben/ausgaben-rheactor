'use strict'

/**
 * @param {CheckingAccountModel} checkingAccount
 * @param {UserModel} user
 */
function CreateCheckingAccountUserCommand (checkingAccount, user) {
  this.checkingAccount = checkingAccount
  this.user = user
}

module.exports = CreateCheckingAccountUserCommand
