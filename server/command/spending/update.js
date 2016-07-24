'use strict'

/**
 * @param {SpendingModel} spending
 * @param {String} category
 * @param {String} title
 * @param {Number} amount
 * @param {Boolean} booked
 * @param {Number} bookedAt
 * @param {Boolean} saving
 * @param {UserModel} author
 */
function UpdateSpendingCommand (spending, category, title, amount, booked, bookedAt, saving, author) {
  this.spending = spending
  this.category = category
  this.title = title
  this.amount = amount
  this.booked = booked
  this.bookedAt = bookedAt
  this.saving = saving
  this.author = author
}

module.exports = UpdateSpendingCommand
