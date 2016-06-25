'use strict'

const AggregateRepository = require('rheactor-event-store/aggregate-repository')
const ModelEvent = require('rheactor-event-store/model-event')
const util = require('util')
const SpendingModel = require('../model/spending')
const Promise = require('bluebird')

/**
 * Creates a new spending repository
 *
 * @param {redis.client} redis
 * @constructor
 */
var SpendingRepository = function (redis) {
  AggregateRepository.call(this, SpendingModel, 'spending', redis)
}
util.inherits(SpendingRepository, AggregateRepository)

/**
 * @param {SpendingModel} spending
 */
SpendingRepository.prototype.add = function (spending) {
  let self = this
  let data = {
    checkingAccount: spending.checkingAccount,
    author: spending.author,
    type: spending.type.toString(),
    category: spending.category,
    title: spending.title,
    amount: spending.amount,
    booked: spending.booked
  }
  if (spending.bookedAt) {
    data.bookedAt = spending.bookedAt
  }
  return Promise
    .resolve(self.redis.incrAsync(self.aggregateAlias + ':id'))
    .then((id) => {
      let event = new ModelEvent(id, 'SpendingCreatedEvent', data)
      return this.eventStore
        .persist(event)
        .then(() => {
          spending.applyEvent(event)
          return event
        })
    })
}

module.exports = SpendingRepository
