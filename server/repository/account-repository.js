'use strict'

const AggregateRepository = require('rheactor-event-store/aggregate-repository')
const util = require('util')
const AccountModel = require('../model/account')

/**
 * Creates a new account repository
 *
 * @param {redis.client} redis
 * @constructor
 */
var AccountRepository = function (redis) {
  AggregateRepository.call(this, AccountModel, 'account', redis)
}
util.inherits(AccountRepository, AggregateRepository)

module.exports = AccountRepository
