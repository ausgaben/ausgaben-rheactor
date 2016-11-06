'use strict'

const util = require('util')
const Joi = require('joi')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const UnhandledDomainEventError = require('rheactor-value-objects/errors/unhandled-domain-event')
const AggregateRoot = require('rheactor-event-store/aggregate-root')
const CheckingAccountPropertyChangedEvent = require('../event/checking-account/property-changed')
const CheckingAccountCreatedEvent = require('../event/checking-account/created')

/**
 * @param {String} name
 * @param {Boolean} monthly
 * @param {Boolean} savings
 * @constructor
 * @throws ValidationFailedError if the creation fails due to invalid data
 */
function CheckingAccountModel (name, monthly, savings) {
  monthly = !!monthly
  savings = !!savings
  AggregateRoot.call(this)
  let schema = Joi.object().keys({
    name: Joi.string().min(1).required().trim(),
    monthly: Joi.boolean().required(),
    savings: Joi.boolean().required()
  })
  Joi.validate({name, monthly, savings}, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedError('CheckingAccountModel validation failed: ' + err, data, err)
    }
    this.name = data.name
    this.monthly = data.monthly
    this.savings = data.savings
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
    case CheckingAccountCreatedEvent.name:
      this.name = data.name
      this.monthly = data.monthly
      this.savings = data.savings
      this.persisted(event.aggregateId, event.createdAt)
      break
    case CheckingAccountPropertyChangedEvent.name:
      this[data.property] = data.value
      this.updated(event.createdAt)
      break
    default:
      console.error('Unhandled CheckingAccountModel event', event.name)
      throw new UnhandledDomainEventError(event.name)
  }
}

/**
 * @param  {boolean} monthly
 * @returns {SpendingUpdatedEvent}
 */
CheckingAccountModel.prototype.setMonthly = function (monthly) {
  let self = this
  if (self.monthly === !!monthly) {
    throw new ValidationFailedError('Monthly unchanged', monthly)
  }
  self.monthly = !!monthly
  self.updated()
  return new CheckingAccountPropertyChangedEvent({
    aggregateId: self.aggregateId(),
    data: {
      property: 'monthly',
      value: monthly
    }
  })
}

/**
 * @param  {boolean} savings
 * @returns {SpendingUpdatedEvent}
 */
CheckingAccountModel.prototype.setSavings = function (savings) {
  let self = this
  if (self.savings === !!savings) {
    throw new ValidationFailedError('Savings unchanged', savings)
  }
  self.savings = !!savings
  self.updated()
  return new CheckingAccountPropertyChangedEvent({
    aggregateId: self.aggregateId(),
    data: {
      property: 'savings',
      value: savings
    }
  })
}

module.exports = CheckingAccountModel
