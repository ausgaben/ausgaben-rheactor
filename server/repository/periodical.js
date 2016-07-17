'use strict'

const AggregateRepository = require('rheactor-event-store/aggregate-repository')
const AggregateRelation = require('rheactor-event-store/aggregate-relation')
const util = require('util')
const PeriodicalModel = require('../model/periodical')
const PeriodicalCreatedEvent = require('../event/periodical/created')

/**
 * Creates a new periodical repository
 *
 * @param {redis.client} redis
 * @constructor
 */
var PeriodicalRepository = function (redis) {
  AggregateRepository.call(this, PeriodicalModel, 'periodical', redis)
  this.relation = new AggregateRelation(this, redis)
}
util.inherits(PeriodicalRepository, AggregateRepository)

/**
 * @param {PeriodicalModel} periodical
 */
PeriodicalRepository.prototype.add = function (periodical) {
  let self = this
  let data = {
    checkingAccount: periodical.checkingAccount,
    author: periodical.author,
    category: periodical.category,
    title: periodical.title,
    amount: periodical.amount,
    estimate: periodical.estimate,
    startsAt: periodical.startsAt,
    enabledIn: periodical.enabledIn,
    saving: periodical.saving
  }
  return self.redis.incrAsync(self.aggregateAlias + ':id')
    .then((aggregateId) => {
      let event = new PeriodicalCreatedEvent({aggregateId, data})
      return this.eventStore
        .persist(event)
        .then(() => {
          self.relation.addRelatedId('checkingAccount', data.checkingAccount, aggregateId)
        })
        .then(() => {
          periodical.applyEvent(event)
          return event
        })
    })
}

/**
 * Find all periodicals for a month
 *
 * @param {Number} timestamp
 */
PeriodicalRepository.prototype.findByMonth = function (timestamp) {
  let self = this
  let mask = PeriodicalModel.monthFlags[new Date(timestamp).getMonth()]
  return AggregateRepository.prototype.findAll.call(self)
    .filter((periodical) => {
      return periodical.enabledIn & mask
    })
}

module.exports = PeriodicalRepository
