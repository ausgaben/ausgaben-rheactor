'use strict'

const util = require('util')
const Joi = require('joi')
const ValidationFailedException = require('rheactor-value-objects/errors').ValidationFailedException
const Errors = require('rheactor-value-objects/errors')
const AggregateRoot = require('rheactor-event-store/aggregate-root')

/**
 * @param {String} name
 * @constructor
 * @throws ValidationFailedException if the creation fails due to invalid data
 */
function AccountModel (name) {
  AggregateRoot.call(this)
  let schema = Joi.object().keys({
    name: Joi.string().min(1).required().trim()
  })
  Joi.validate({name}, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedException('AccountModel validation failed: ' + err, data, err)
    }
    this.name = data.name
  })
}
util.inherits(AccountModel, AggregateRoot)

/**
 * Applies the event
 *
 * @param {ModelEvent} event
 */
AccountModel.prototype.applyEvent = function (event) {
  let data = event.data
  switch (event.name) {
    case 'AccountCreatedEvent':
      this.name = data.name
      this.persisted(event.aggregateId, event.createdAt)
      break
    default:
      console.error('Unhandled AccountModel event', event.name)
      throw new Errors.UnhandledDomainEvent(event.name)
  }
}

module.exports = AccountModel
