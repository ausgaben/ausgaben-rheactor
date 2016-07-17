'use strict'

/**
 * @param {CheckingAccountModel} checkingAccount
 * @param {String} category
 * @param {String} title
 * @param {Number} amount
 * @param {Boolean} estimate
 * @param {Number} startsAt
 * @param {Boolean} enabledIn01
 * @param {Boolean} enabledIn02
 * @param {Boolean} enabledIn03
 * @param {Boolean} enabledIn04
 * @param {Boolean} enabledIn05
 * @param {Boolean} enabledIn06
 * @param {Boolean} enabledIn07
 * @param {Boolean} enabledIn08
 * @param {Boolean} enabledIn09
 * @param {Boolean} enabledIn10
 * @param {Boolean} enabledIn11
 * @param {Boolean} enabledIn12
 * @param {Boolean} saving
 * @param {UserModel} author
 */
function CreatePeriodicalCommand (checkingAccount, category, title, amount, estimate, startsAt, enabledIn01, enabledIn02, enabledIn03, enabledIn04, enabledIn05, enabledIn06, enabledIn07, enabledIn08, enabledIn09, enabledIn10, enabledIn11, enabledIn12, saving, author) {
  this.checkingAccount = checkingAccount
  this.category = category
  this.title = title
  this.amount = amount
  this.estimate = estimate
  this.startsAt = startsAt
  this.enabledIn01 = enabledIn01
  this.enabledIn02 = enabledIn02
  this.enabledIn03 = enabledIn03
  this.enabledIn04 = enabledIn04
  this.enabledIn05 = enabledIn05
  this.enabledIn06 = enabledIn06
  this.enabledIn07 = enabledIn07
  this.enabledIn08 = enabledIn08
  this.enabledIn09 = enabledIn09
  this.enabledIn10 = enabledIn10
  this.enabledIn11 = enabledIn11
  this.enabledIn12 = enabledIn12
  this.saving = saving
  this.author = author
}

module.exports = CreatePeriodicalCommand
