'use strict'

const SpendingCreatedEvent = require('../../event/spending/created')
const SpendingUpdatedEvent = require('../../event/spending/updated')
const t = require('tcomb')
const PositiveIntegerType = t.refinement(t.Number, (n) => n % 1 === 0 && n > 0, 'PositiveInteger')
const scalarType = t.union([t.String, t.Number])

/**
 * Maintains an index to sort spendings by bookedAt
 *
 * @param repositories
 * @param redis
 * @param {BackendEmitter} emitter
 * @constructor
 */
const SpendingBookedAtIndex = function (repositories, redis, emitter) {
  const self = this
  t.Object(repositories)
  t.Object(redis)
  t.Object(emitter)
  this.repositories = repositories
  this.redis = redis

  emitter.on(
    emitter.toEventName(SpendingCreatedEvent),
    event => repositories.spending.getById(event.aggregateId).then(spending => self.indexSpending(spending))
  )
  emitter.on(
    emitter.toEventName(SpendingUpdatedEvent),
    event => {
      if (event.data.property === 'bookedAt') {
        return repositories.spending.getById(event.aggregateId).then(spending => self.indexSpending(spending))
      }
    }
  )
}

SpendingBookedAtIndex.prototype.index = function () {
  let self = this
  return self.repositories.spending.findAll()
    .map(spending => self.indexSpending(spending))
}

/**
 * @param {SpendingModel} spending
 * @return {Promise}
 */
SpendingBookedAtIndex.prototype.indexSpending = function (spending) {
  t.Object(spending)
  const self = this
  if (!spending.bookedAt) return
  const score = spending.bookedAt
  return self.redis.zaddAsync('checkingAccount:spending-bookedAt:' + spending.checkingAccount, score, spending.aggregateId())
}

/**
 * @param {Number} checkingAccount
 * @param {Number} dateFrom
 * @param {Number} dateTo
 * @return {Promise.<Array.<Number>>}
 */
SpendingBookedAtIndex.prototype.range = function (checkingAccount, dateFrom, dateTo) {
  scalarType(checkingAccount)
  t.maybe(PositiveIntegerType)(dateFrom)
  t.maybe(PositiveIntegerType)(dateTo)
  if (!dateTo) dateTo = '+inf'
  if (!dateFrom) dateFrom = '-inf'
  const self = this
  return self.redis.zrangebyscoreAsync('checkingAccount:spending-bookedAt:' + checkingAccount, '' + dateFrom, '' + dateTo)
}

module.exports = SpendingBookedAtIndex
