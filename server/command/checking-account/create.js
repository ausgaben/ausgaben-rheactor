'use strict'

/**
 * @param {String} name
 * @param {Boolean} monthly
 * @param {UserModel} author
 */
function CreateCheckingAccountCommand (name, monthly, author) {
  this.name = name
  this.monthly = monthly
  this.author = author
}

module.exports = CreateCheckingAccountCommand
