/**
 * @param {CheckingAccountModel} checkingAccount
 * @param {String} property
 * @param {object} value
 * @param {UserModel} author
 */
function UpdateCheckingAccountPropertyCommand (checkingAccount, property, value, author) {
  this.checkingAccount = checkingAccount
  this.property = property
  this.value = value
  this.author = author
}

export default UpdateCheckingAccountPropertyCommand
