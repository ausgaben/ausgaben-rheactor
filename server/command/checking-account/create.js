'use strict'

/**
 * @param {String} name
 * @param {UserModel} author
 */
function CreateCheckingAccountCommand (name, author) {
  this.name = name
  this.author = author
}

module.exports = CreateCheckingAccountCommand
