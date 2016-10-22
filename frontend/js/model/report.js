'use strict'

const Aggregate = require('rheactor-web-app/js/model/aggregate')
const _forEach = require('lodash/forEach')
const _create = require('lodash/create')

/**
 * @param {object} data
 * @constructor
 */
function Report (data) {
  this.balance = undefined
  this.income = undefined
  this.spendings = undefined
  this.savings = undefined
  this.savingsRate = undefined
  this.checkingAccount = undefined

  if (data) {
    var self = this
    _forEach(this, function (value, key) {
      self[key] = data[key] === undefined ? undefined : data[key]
    })
  }
  this.$context = Report.$context
}
Report.prototype = _create(Aggregate.prototype, {
  'constructor': Report
})

Report.$context = 'https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Report'

module.exports = Report
