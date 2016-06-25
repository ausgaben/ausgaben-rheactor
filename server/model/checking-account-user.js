'use strict'

const util = require('util')
const Joi = require('joi')
const AggregateRoot = require('rheactor-event-store/aggregate-root')
const ValidationFailedException = require('rheactor-value-objects/errors').ValidationFailedException
const Errors = require('rheactor-value-objects/errors')
const CheckingAccountUserCreatedEvent = require('../event/checking-account-user/created')
/**
 * @param {String} checkingAccount
 * @param {String} user
 * @constructor
 * @throws ValidationFailedException if the creation fails due to invalid data
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
      throw new ValidationFailedException('CheckingAccountUserModel validation failed', data, err)
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
      throw new Errors.UnhandledDomainEvent(event.name)
  }
}

module.exports = CheckingAccountUserModel
