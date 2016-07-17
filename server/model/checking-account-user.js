'use strict'

const util = require('util')
const Joi = require('joi')
const AggregateRoot = require('rheactor-event-store/aggregate-root')
const CheckingAccountUserCreatedEvent = require('../event/checking-account-user/created')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const UnhandledDomainEventError = require('rheactor-value-objects/errors/unhandled-domain-event')

/**
 * @param {String} checkingAccount
 * @param {String} user
 * @constructor
 * @throws ValidationFailedError if the creation fails due to invalid data
 */
function CheckingAccountUserModel (checkingAccount, user) {
  AggregateRoot.call(this)
  let schema = Joi.object().keys({
    checkingAccount: Joi.string().required().trim(),
    user: Joi.string().required().trim()
  })
  Joi.validate({
    checkingAccount,
    user
  }, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedError('CheckingAccountUserModel validation failed', data, err)
    }
    this.checkingAccount = data.checkingAccount
    this.user = data.user
  })
}
util.inherits(CheckingAccountUserModel, AggregateRoot)

/**
 * Applies the event
 *
 * @param {ModelEvent} event
 */
CheckingAccountUserModel.prototype.applyEvent = function (event) {
  let data = event.data
  switch (event.name) {
    case CheckingAccountUserCreatedEvent.name:
      this.checkingAccount = data.checkingAccount
      this.user = data.user
      this.persisted(event.aggregateId, event.createdAt)
      break
    default:
      console.error('Unhandled CheckingAccountUserModel event', event.name)
      throw new UnhandledDomainEventError(event.name)
  }
}

module.exports = CheckingAccountUserModel
