'use strict'

const util = require('util')
const Joi = require('joi')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const UnhandledDomainEventError = require('rheactor-value-objects/errors/unhandled-domain-event')
const AggregateRoot = require('rheactor-event-store/aggregate-root')

/**
 * @param {String} name
 * @param {Boolean} monthly
 * @constructor
 * @throws ValidationFailedError if the creation fails due to invalid data
 */
function CheckingAccountModel (name, monthly) {
  monthly = !!monthly
  AggregateRoot.call(this)
  let schema = Joi.object().keys({
    name: Joi.string().min(1).required().trim(),
    monthly: Joi.boolean().required()
  })
  Joi.validate({name, monthly}, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedError('CheckingAccountModel validation failed: ' + err, data, err)
    }
    this.name = data.name
    this.monthly = data.monthly
  })
}
util.inherits(CheckingAccountModel, AggregateRoot)

/**
 * Applies the event
 *
 * @param {ModelEvent} event
 */
CheckingAccountModel.prototype.applyEvent = function (event) {
  let data = event.data
  switch (event.name) {
    case 'CheckingAccountCreatedEvent':
      this.name = data.name
      this.monthly = data.monthly
      this.persisted(event.aggregateId, event.createdAt)
      break
    default:
      console.error('Unhandled CheckingAccountModel event', event.name)
      throw new UnhandledDomainEventError(event.name)
  }
}

module.exports = CheckingAccountModel
