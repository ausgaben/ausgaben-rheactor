'use strict'

const Promise = require('bluebird')
const CheckingAccountUserCreatedEvent = require('../event/checking-account-user/created')

/**
 * The search service knows about the various repositories and how to use their indices to optimize the search
 *
 * It also maintains own indices
 *
 * @param repositories
 * @param redis
 * @param {BackendEmitter} emitter
 * @constructor
 */
function Search (repositories, redis, emitter) {
  Object.defineProperty(this, 'repositories', {value: repositories})
  Object.defineProperty(this, 'redis', {value: redis})
  Object.defineProperty(this, 'emitter', {value: emitter})
  emitter.on(emitter.toEventName(CheckingAccountUserCreatedEvent),
    /**
     * @param {CheckingAccountUserCreatedEvent} event
     */
    (event) => {
      redis.saddAsync('search:user-checking-account:' + event.data.user, event.data.checkingAccount)
    }
  )
}

/**
 * Search checking accounts
 *
 * @param {Object} query
 * @param {Pagination} pagination
 * @return PaginatedResult
 */
Search.prototype.searchCheckingAccounts = function (query, pagination) {
  let self = this
  let sets = [
    'search:user-checking-account:' + query.user
  ]
  let total
  return Promise
    .resolve(self.redis.sinterAsync.apply(self.redis, sets))
    .filter(id => query.identifier ? id === query.identifier : true)
    .then((ids) => {
      total = ids.length
      return pagination.splice(ids)
    })
    .map(self.repositories.checkingAccount.getById.bind(self.repositories.checkingAccount))
    .then((items) => {
      return pagination.result(items, total, query)
    })
}

/**
 * Search spendings
 *
 * @param {Object} query
 * @param {Pagination} pagination
 * @return PaginatedResult
 */
Search.prototype.searchSpendings = function (query, pagination) {
  let self = this
  let sets = [
    self.repositories.spending.aggregateAlias + ':checkingAccount:' + query.checkingAccount
  ]
  let total
  return Promise
    .resolve(self.redis.sinterAsync.apply(self.redis, sets))
    .then((ids) => {
      total = ids.length
      return pagination.splice(ids)
    })
    .map(self.repositories.spending.getById.bind(self.repositories.spending))
    .then((items) => {
      return pagination.result(items, total, query)
    })
}

/**
 * Search periodicals
 *
 * @param {Object} query
 * @param {Pagination} pagination
 * @return PaginatedResult
 */
Search.prototype.searchPeriodicals = function (query, pagination) {
  let self = this
  let sets = [
    self.repositories.periodical.aggregateAlias + ':checkingAccount:' + query.checkingAccount
  ]
  let total
  return Promise
    .resolve(self.redis.sinterAsync.apply(self.redis, sets))
    .then((ids) => {
      total = ids.length
      return pagination.splice(ids)
    })
    .map(self.repositories.periodical.getById.bind(self.repositories.periodical))
    .then((items) => {
      return pagination.result(items, total, query)
    })
}

module.exports = Search
