'use strict'

const Aggregate = require('rheactor-web-app/js/model/aggregate')
const _forEach = require('lodash/forEach')
const _create = require('lodash/create')

/**
 * @param {object} data
 * @constructor
 */
function Periodical (data) {
  this.$id = undefined
  this.$version = undefined
  this.$links = undefined
  this.$createdAt = undefined
  this.$updatedAt = undefined
  this.$deletedAt = undefined
  this.category = undefined
  this.title = undefined
  this.amount = undefined
  this.estimate = undefined
  this.startsAt = undefined
  this.enabledIn01 = undefined
  this.enabledIn02 = undefined
  this.enabledIn03 = undefined
  this.enabledIn04 = undefined
  this.enabledIn05 = undefined
  this.enabledIn06 = undefined
  this.enabledIn07 = undefined
  this.enabledIn08 = undefined
  this.enabledIn09 = undefined
  this.enabledIn10 = undefined
  this.enabledIn11 = undefined
  this.enabledIn12 = undefined

  if (data) {
    var self = this
    _forEach(this, function (value, key) {
      self[key] = data[key] === undefined ? undefined : data[key]
    })
  }
  this.$context = Periodical.$context
  this.$acceptedEvents = []
  this.$aggregateAlias = 'periodical'
}
Periodical.prototype = _create(Aggregate.prototype, {
  'constructor': Periodical
})

Periodical.$context = 'https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Periodical'

module.exports = Periodical
