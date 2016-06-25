'use strict'

const AggregateRepository = require('rheactor-event-store/aggregate-repository')
const util = require('util')
const CheckingAccountModel = require('../model/checking-account')
const CheckingAccountCreatedEvent = require('../event/checking-account/created')

/**
 * Creates a new checkingAccount repository
 *
 * @param {redis.client} redis
 * @constructor
 */
var CheckingAccountRepository = function (redis) {
  AggregateRepository.call(this, CheckingAccountModel, 'checkingAccount', redis)
}
util.inherits(CheckingAccountRepository, AggregateRepository)

/**
 * @param {CheckingAccountModel} checkingAccount
 * @returns {Promise.<CheckingAccountCreatedEvent>}
 */
CheckingAccountRepository.prototype.add = function (checkingAccount) {
  let self = this
  return AggregateRepository.prototype.add.call(self, checkingAccount)
    .then((event) => {
      return new CheckingAccountCreatedEvent(event)
    })
}

module.exports = CheckingAccountRepository
