'use strict'

const util = require('util')
const Joi = require('joi')
const AggregateRoot = require('rheactor-event-store/aggregate-root')
const PeriodicalModel = require('./periodical')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const UnhandledDomainEventError = require('rheactor-value-objects/errors/unhandled-domain-event')

/**
 * @param {String} checkingAccount
 * @param {String} author
 * @param {String} category
 * @param {String} title
 * @param {Number} amount
 * @param {Boolean} booked
 * @param {Number} bookedAt
 * @param {Boolean} saving
 * @constructor
 * @throws ValidationFailedError if the creation fails due to invalid data
 */
function SpendingModel (checkingAccount, author, category, title, amount, booked, bookedAt, saving) {
  AggregateRoot.call(this)
  booked = booked || false
  let schema = Joi.object().keys({
    checkingAccount: Joi.string().min(1).required().trim(),
    author: Joi.string().min(1).required().trim(),
    category: Joi.string().min(1).required().trim(),
    title: Joi.string().min(1).required().trim(),
    amount: Joi.number().integer().required(),
    booked: Joi.boolean().required(),
    bookedAt: Joi.number().integer().min(1),
    saving: Joi.boolean().default(false)
  })
  Joi.validate({checkingAccount, author, category, title, amount, booked, bookedAt, saving}, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedError('SpendingModel validation failed: ' + err, data, err)
    }
    this.checkingAccount = data.checkingAccount
    this.author = data.author
    this.category = data.category
    this.title = data.title
    this.amount = data.amount
    this.booked = data.booked
    this.bookedAt = data.bookedAt
    this.saving = data.saving
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
      data.periodical.category,
      data.periodical.title,
      data.periodical.amount,
      false,
      data.bookedAt,
      data.periodical.saving
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
      self.category = data.category
      self.title = data.title
      self.amount = data.amount
      self.booked = data.booked
      self.bookedAt = data.bookedAt
      self.saving = data.saving
      this.persisted(event.aggregateId, event.createdAt)
      break
    default:
      console.error('Unhandled SpendingModel event', event.name)
      throw new UnhandledDomainEventError(event.name)
  }
}

module.exports = SpendingModel
