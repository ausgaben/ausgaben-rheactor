'use strict'

const AggregateRepository = require('rheactor-event-store/aggregate-repository')
const ModelEvent = require('rheactor-event-store/model-event')
const util = require('util')
const PeriodicalModel = require('../model/periodical')
const Promise = require('bluebird')

/**
 * Creates a new periodical repository
 *
 * @param {redis.client} redis
 * @constructor
 */
var PeriodicalRepository = function (redis) {
  AggregateRepository.call(this, PeriodicalModel, 'periodical', redis)
}
util.inherits(PeriodicalRepository, AggregateRepository)

/**
 * @param {PeriodicalModel} periodical
 */
PeriodicalRepository.prototype.add = function (periodical) {
  let self = this
  let data = {
    account: periodical.account,
    author: periodical.author,
    type: periodical.type.toString(),
    category: periodical.category,
    title: periodical.title,
    amount: periodical.amount,
    estimate: periodical.estimate,
    startsAt: periodical.startsAt,
    enabledIn: periodical.enabledIn
  }
  return Promise
    .resolve(self.redis.incrAsync(self.aggregateAlias + ':id'))
    .then((id) => {
      let event = new ModelEvent(id, 'PeriodicalCreatedEvent', data)
      return this.eventStore
        .persist(event)
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
