'use strict'

/**
 * @param {CheckingAccountModel} checkingAccount
 * @param {String} category
 * @param {String} title
 * @param {Number} amount
 * @param {Boolean} booked
 * @param {Number} bookedAt
 * @param {Boolean} saving
 * @param {UserModel} author
 */
function CreateSpendingCommand (checkingAccount, category, title, amount, booked, bookedAt, saving, author) {
  this.checkingAccount = checkingAccount
  this.category = category
  this.title = title
  this.amount = amount
  this.booked = booked
  this.bookedAt = bookedAt
  this.saving = saving
  this.author = author
}

module.exports = CreateSpendingCommand
