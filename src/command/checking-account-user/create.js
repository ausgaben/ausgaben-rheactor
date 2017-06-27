/**
 * @param {CheckingAccountModel} checkingAccount
 * @param {UserModel} user
 */
function CreateCheckingAccountUserCommand (checkingAccount, user) {
  this.checkingAccount = checkingAccount
  this.user = user
}

export default CreateCheckingAccountUserCommand
