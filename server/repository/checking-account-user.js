'use strict'

const AggregateRepository = require('rheactor-event-store/aggregate-repository')
const AggregateIndex = require('rheactor-event-store/aggregate-index')
const AggregateRelation = require('rheactor-event-store/aggregate-relation')
const util = require('util')
const CheckingAccountUserModel = require('../model/checking-account-user')
const CheckingAccountUserCreatedEvent = require('../event/checking-account-user/created')

/**
 * Creates a new CheckingAccountUser repository
 *
 * @param {redis.client} redis
 * @constructor
 */
var CheckingAccountUserRepository = function (redis) {
  AggregateRepository.call(this, CheckingAccountUserModel, 'checkingAccountUser', redis)
  this.index = new AggregateIndex(this.aggregateAlias, redis)
  this.relation = new AggregateRelation(this, redis)
}
util.inherits(CheckingAccountUserRepository, AggregateRepository)

/**
 * @param {CheckingAccountUserModel} checkingAccountUserModel
 * @returns {Promise.<CheckingAccountUserCreatedEvent>}
 */
CheckingAccountUserRepository.prototype.add = function (checkingAccountUserModel) {
  let self = this
  return self.index.addToListIfNotPresent('user-checkingAccounts:' + checkingAccountUserModel.user, checkingAccountUserModel.checkingAccount)
    .then(() => {
      return AggregateRepository.prototype.add.call(self, checkingAccountUserModel)
    })
    .then((event) => {
      return self.relation.addRelatedId('checkingAccount', checkingAccountUserModel.checkingAccount, event.aggregateId)
        .then(() => {
          return new CheckingAccountUserCreatedEvent(event)
        })
    })
}

CheckingAccountUserRepository.prototype.findByCheckingAccountId = function (checkingAccountId) {
  let self = this
  return self.relation.findByRelatedId('checkingAccount', checkingAccountId)
}

module.exports = CheckingAccountUserRepository
