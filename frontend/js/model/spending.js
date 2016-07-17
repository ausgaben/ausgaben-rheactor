'use strict'

const Aggregate = require('rheactor-web-app/js/model/aggregate')
const _forEach = require('lodash/forEach')
const _create = require('lodash/create')

/**
 * @param {object} data
 * @constructor
 */
function Spending (data) {
  this.$id = undefined
  this.$version = undefined
  this.$links = undefined
  this.$createdAt = undefined
  this.$updatedAt = undefined
  this.$deletedAt = undefined
  this.category = undefined
  this.title = undefined
  this.amount = undefined
  this.booked = undefined
  this.bookedAt = undefined
  this.saving = undefined

  if (data) {
    var self = this
    _forEach(this, function (value, key) {
      self[key] = data[key] === undefined ? undefined : data[key]
    })
  }
  this.$context = Spending.$context
  this.$acceptedEvents = []
  this.$aggregateAlias = 'spending'
}
Spending.prototype = _create(Aggregate.prototype, {
  'constructor': Spending
})

Spending.$context = 'https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Spending'

module.exports = Spending
