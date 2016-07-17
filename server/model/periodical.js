'use strict'

const util = require('util')
const Joi = require('joi')
const AggregateRoot = require('rheactor-event-store/aggregate-root')
const _reduce = require('lodash/reduce')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const UnhandledDomainEventError = require('rheactor-value-objects/errors/unhandled-domain-event')

/**
 * @param {String} checkingAccount
 * @param {String} author
 * @param {String} category
 * @param {String} title
 * @param {Number} amount
 * @param {Boolean} estimate
 * @param {Number} startsAt
 * @param {Boolean} saving
 * @constructor
 * @throws ValidationFailedError if the creation fails due to invalid data
 */
function PeriodicalModel (checkingAccount, author, category, title, amount, estimate, startsAt, saving) {
  AggregateRoot.call(this)
  let schema = Joi.object().keys({
    checkingAccount: Joi.string().min(1).required().trim(),
    author: Joi.string().min(1).required().trim(),
    category: Joi.string().min(1).required().trim(),
    title: Joi.string().min(1).required().trim(),
    amount: Joi.number().integer().required(),
    estimate: Joi.boolean().required(),
    startsAt: Joi.number().integer().min(1).required(),
    saving: Joi.boolean().default(false)
  })
  Joi.validate({checkingAccount, author, category, title, amount, estimate, startsAt, saving}, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedError('PeriodicalModel validation failed: ' + err, data, err)
    }
    this.checkingAccount = data.checkingAccount
    this.author = data.author
    this.category = data.category
    this.title = data.title
    this.amount = data.amount
    this.estimate = data.estimate
    this.startsAt = data.startsAt
    this.enabledIn = _reduce(PeriodicalModel.monthFlags, (all, flag) => {
      return all | flag
    }, 0)
    this.saving = data.saving
  })
}
util.inherits(PeriodicalModel, AggregateRoot)

/**
 * Applies the event
 *
 * @param {ModelEvent} event
 */
PeriodicalModel.prototype.applyEvent = function (event) {
  let self = this
  let data = event.data
  switch (event.name) {
    case 'PeriodicalCreatedEvent':
      self.checkingAccount = data.checkingAccount
      self.author = data.author
      self.category = data.category
      self.title = data.title
      self.amount = data.amount
      self.estimate = data.estimate
      self.startsAt = data.startsAt
      self.enabledIn = data.enabledIn
      self.saving = data.saving
      this.persisted(event.aggregateId, event.createdAt)
      break
    default:
      console.error('Unhandled SpendingModel event', event.name)
      throw new UnhandledDomainEventError(event.name)
  }
}

PeriodicalModel.monthFlags = [
  1,
  2,
  4,
  8,
  16,
  32,
  64,
  128,
  256,
  512,
  1024,
  2048
]

module.exports = PeriodicalModel
