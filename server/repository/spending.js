'use strict'

const AggregateRepository = require('rheactor-event-store/aggregate-repository')
const AggregateRelation = require('rheactor-event-store/aggregate-relation')
const util = require('util')
const SpendingModel = require('../model/spending')
const SpendingCreatedEvent = require('../event/spending/created')
const SpendingDeletedEvent = require('../event/spending/deleted')

/**
 * Creates a new spending repository
 *
 * @param {redis.client} redis
 * @constructor
 */
var SpendingRepository = function (redis) {
  AggregateRepository.call(this, SpendingModel, 'spending', redis)
  this.relation = new AggregateRelation(this, redis)
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
    category: spending.category,
    title: spending.title,
    amount: spending.amount,
    booked: spending.booked,
    saving: spending.saving
  }
  if (spending.bookedAt) {
    data.bookedAt = spending.bookedAt
  }
  return self.redis.incrAsync(self.aggregateAlias + ':id')
    .then((aggregateId) => {
      let event = new SpendingCreatedEvent({
        aggregateId,
        data
      })
      return this.eventStore
        .persist(event)
        .then(() => {
          self.relation.addRelatedId('checkingAccount', data.checkingAccount, aggregateId)
        })
        .then(() => {
          spending.applyEvent(event)
          return event
        })
    })
}

/**
 * Deletes a Spending
 *
 * @param {SpendingModel} spending
 * @param {UserModel} author
 * @return {Promise.<SpendingDeletedEvent>}
 */
SpendingRepository.prototype.remove = function (spending, author) {
  let self = this
  let event = new SpendingDeletedEvent({aggregateId: spending.aggregateId(), createdBy: author.aggregateId()})
  return self.persistEvent(event, author)
    .then(() => self.relation.removeRelatedId('checkingAccount', spending.checkingAccount, spending.aggregateId()))
    .then(() => {
      spending.applyEvent(event)
      return event
    })
}

SpendingRepository.prototype.findByCheckingAccountId = function (checkingAccountId) {
  let self = this
  return self.relation.findByRelatedId('checkingAccount', checkingAccountId)
}

module.exports = SpendingRepository
