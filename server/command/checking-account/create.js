/**
 * @param {String} name
 * @param {Boolean} monthly
 * @param {UserModel} author
 */
function CreateCheckingAccountCommand (name, monthly, savings, author) {
  this.name = name
  this.monthly = monthly
  this.savings = savings
  this.author = author
}

export default CreateCheckingAccountCommand
