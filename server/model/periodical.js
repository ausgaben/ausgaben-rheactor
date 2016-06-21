'use strict'

const util = require('util')
const Joi = require('joi')
const SpendingTypeValue = require('../valueobject/spending-type')
const ValidationFailedException = require('rheactor-value-objects/errors').ValidationFailedException
const AggregateRoot = require('rheactor-event-store/aggregate-root')
const _reduce = require('lodash/reduce')
const Errors = require('rheactor-value-objects/errors')

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

/**
 * @param {String} account
 * @param {String} author
 * @param {SpendingTypeValue} type
 * @param {String} category
 * @param {String} title
 * @param {Number} amount
 * @param {Boolean} estimate
 * @param {Number} startsAt
 * @constructor
 * @throws ValidationFailedException if the creation fails due to invalid data
 */
function PeriodicalModel (account, author, type, category, title, amount, estimate, startsAt) {
  AggregateRoot.call(this)
  let schema = Joi.object().keys({
    account: Joi.string().min(1).required().trim(),
    author: Joi.string().min(1).required().trim(),
    type: Joi.object().type(SpendingTypeValue).required(),
    category: Joi.string().min(1).required().trim(),
    title: Joi.string().min(1).required().trim(),
    amount: Joi.number().integer().required(),
    estimate: Joi.boolean().required(),
    startsAt: Joi.number().integer().min(1).required()
  })
  Joi.validate({account, author, type, category, title, amount, estimate, startsAt}, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedException('PeriodicalModel validation failed: ' + err, data, err)
    }
    this.account = data.account
    this.author = data.author
    this.type = data.type
    this.category = data.category
    this.title = data.title
    this.amount = data.amount
    this.estimate = data.estimate
    this.startsAt = data.startsAt
    this.enabledIn = _reduce(PeriodicalModel.monthFlags, (all, flag) => {
      return all | flag
    }, 0)
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
      self.account = data.account
      self.author = data.author
      self.type = new SpendingTypeValue(data.type)
      self.category = data.category
      self.title = data.title
      self.amount = data.amount
      self.estimate = data.estimate
      self.startsAt = data.startsAt
      self.enabledIn = data.enabledIn
      this.persisted(event.aggregateId, event.createdAt)
      break
    default:
      console.error('Unhandled SpendingModel event', event.name)
      throw new Errors.UnhandledDomainEvent(event.name)
  }
}

module.exports = PeriodicalModel
