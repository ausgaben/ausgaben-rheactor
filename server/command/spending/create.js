'use strict'

/**
 * @param {CheckingAccountModel} checkingAccount
 * @param {SpendingTypeValue} type
 * @param {String} category
 * @param {String} title
 * @param {Number} amount
 * @param {Boolean} booked
 * @param {Number} bookedAt
 * @param {UserModel} author
 */
function CreateSpendingCommand (checkingAccount, type, category, title, amount, booked, bookedAt, author) {
  this.checkingAccount = checkingAccount
  this.type = type
  this.category = category
  this.title = title
  this.amount = amount
  this.booked = booked
  this.bookedAt = bookedAt
  this.author = author
}

module.exports = CreateSpendingCommand
