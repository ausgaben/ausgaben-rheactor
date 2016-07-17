'use strict'

const util = require('util')
const Joi = require('joi')
const SpendingTypeValue = require('../valueobject/spending-type')
const AggregateRoot = require('rheactor-event-store/aggregate-root')
const PeriodicalModel = require('./periodical')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const UnhandledDomainEventError = require('rheactor-value-objects/errors/unhandled-domain-event')

/**
 * @param {String} checkingAccount
 * @param {String} author
 * @param {SpendingTypeValue} type
 * @param {String} category
 * @param {String} title
 * @param {Number} amount
 * @param {Boolean} booked
 * @param {Number} bookedAt
 * @constructor
 * @throws ValidationFailedError if the creation fails due to invalid data
 */
function SpendingModel (checkingAccount, author, type, category, title, amount, booked, bookedAt) {
  AggregateRoot.call(this)
  booked = booked || false
  let schema = Joi.object().keys({
    checkingAccount: Joi.string().min(1).required().trim(),
    author: Joi.string().min(1).required().trim(),
    type: Joi.object().type(SpendingTypeValue).required(),
    category: Joi.string().min(1).required().trim(),
    title: Joi.string().min(1).required().trim(),
    amount: Joi.number().integer().required(),
    booked: Joi.boolean().required(),
    bookedAt: Joi.number().integer().min(1)
  })
  Joi.validate({checkingAccount, author, type, category, title, amount, booked, bookedAt}, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedError('SpendingModel validation failed: ' + err, data, err)
    }
    this.checkingAccount = data.checkingAccount
    this.author = data.author
    this.type = data.type
    this.category = data.category
    this.title = data.title
    this.amount = data.amount
    this.booked = data.booked
    this.bookedAt = data.bookedAt
  })
}
util.inherits(SpendingModel, AggregateRoot)

/**
 * @param {PeriodicalModel} periodical
 * @param {Number} bookedAt
 * @return {SpendingModel}
 */
SpendingModel.fromPeriodical = function (periodical, bookedAt) {
  let schema = Joi.object().keys({
    periodical: Joi.object().type(PeriodicalModel).required(),
    bookedAt: Joi.number().integer().min(1)
  })
  return Joi.validate({periodical, bookedAt}, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedError('SpendingModel.fromPeriodical validation failed: ' + err, {
        periodical,
        bookedAt
      }, err)
    }
    let spending = new SpendingModel(
      data.periodical.checkingAccount,
      data.periodical.author,
      data.periodical.type,
      data.periodical.category,
      data.periodical.title,
      data.periodical.amount,
      false,
      data.bookedAt
    )
    spending.periodical = data.periodical.aggregateId()
    return spending
  })
}

/**
 * Applies the event
 *
 * @param {ModelEvent} event
 */
SpendingModel.prototype.applyEvent = function (event) {
  let self = this
  let data = event.data
  switch (event.name) {
    case 'SpendingCreatedEvent':
      self.checkingAccount = data.checkingAccount
      self.author = data.author
      self.type = new SpendingTypeValue(data.type)
      self.category = data.category
      self.title = data.title
      self.amount = data.amount
      self.booked = data.booked
      self.bookedAt = data.bookedAt
      this.persisted(event.aggregateId, event.createdAt)
      break
    default:
      console.error('Unhandled SpendingModel event', event.name)
      throw new UnhandledDomainEventError(event.name)
  }
}

module.exports = SpendingModel
