'use strict'

/**
 * @param {SpendingModel} spending
 * @param {UserModel} author
 */
function DeleteSpendingCommand (spending, author) {
  this.spending = spending
  this.author = author
}

module.exports = DeleteSpendingCommand
