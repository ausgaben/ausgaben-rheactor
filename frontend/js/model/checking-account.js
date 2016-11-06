'use strict'

const Aggregate = require('rheactor-web-app/js/model/aggregate')
const _forEach = require('lodash/forEach')
const _create = require('lodash/create')

/**
 * @param {object} data
 * @constructor
 */
function CheckingAccount (data) {
  this.$id = undefined
  this.$version = undefined
  this.$links = undefined
  this.$createdAt = undefined
  this.$updatedAt = undefined
  this.$deletedAt = undefined
  this.identifier = undefined
  this.name = undefined
  this.monthly = undefined
  this.savings = undefined

  if (data) {
    var self = this
    _forEach(this, function (value, key) {
      self[key] = data[key] === undefined ? undefined : data[key]
    })
  }
  this.$context = CheckingAccount.$context
  this.$acceptedEvents = []
  this.$aggregateAlias = 'checkingAccount'
}
CheckingAccount.prototype = _create(Aggregate.prototype, {
  'constructor': CheckingAccount
})

CheckingAccount.$context = 'https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#CheckingAccount'

module.exports = CheckingAccount
