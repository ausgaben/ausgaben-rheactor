'use strict'

const SpendingCreatedEvent = require('../../event/spending/created')
const SpendingUpdatedEvent = require('../../event/spending/updated')
const t = require('tcomb')
const scalarType = t.union([t.String, t.Number])

/**
 * Maintains an index of titles in use for autocompletion
 *
 * @param repositories
 * @param redis
 * @param {BackendEmitter} emitter
 * @constructor
 */
const TitlesIndex = function (repositories, redis, emitter) {
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
      if (event.data.property === 'title') {
        return repositories.spending.getById(event.aggregateId).then(spending => self.indexSpending(spending))
      }
    }
  )
}

TitlesIndex.prototype.index = function () {
  let self = this
  return self.repositories.spending.findAll()
    .map(spending => self.indexSpending(spending))
}

/**
 * @param {SpendingModel} spending
 * @return {Promise}
 */
TitlesIndex.prototype.indexSpending = function (spending) {
  t.Object(spending)
  const self = this
  return self.redis.saddAsync('spending-titles:' + spending.checkingAccount + ':' + spending.category, spending.title)
}

/**
 * @param {Number} checkingAccount
 * @param {string} category
 * @return {Promise.<Array.<String>>}
 */
TitlesIndex.prototype.all = function (checkingAccount, category) {
  scalarType(checkingAccount)
  const self = this
  return self.redis.smembersAsync('spending-titles:' + checkingAccount + ':' + category)
}

module.exports = TitlesIndex
