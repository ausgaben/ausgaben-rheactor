import {AggregateRoot, ModelEvent, AggregateIdType} from 'rheactor-event-store'
import {PeriodicalModel, PeriodicalModelType} from './periodical'
import {ValidationFailedError, UnhandledDomainEventError} from '@resourcefulhumans/rheactor-errors'
import {SpendingCreatedEvent, SpendingUpdatedEvent, SpendingDeletedEvent} from '../events'
import {Boolean as BooleanType, Integer as IntegerType, String as StringType, refinement, maybe} from 'tcomb'
const NonEmptyStringType = refinement(StringType, s => s.length > 0, 'NonEmptyStringType')
const ZeroOrPositiveIntegerType = refinement(IntegerType, n => n >= 0, 'ZeroOrPositiveIntegerType')
const TimestampType = refinement(IntegerType, n => n > 0, 'TimestampType')
const MaybeTimestampType = maybe(TimestampType, 'MaybeTimestampType')

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
export class SpendingModel extends AggregateRoot {
  constructor (checkingAccount, author, category, title, amount, booked = false, bookedAt, saving = false) {
    super()
    AggregateIdType(checkingAccount, ['SpendingModel', 'checkingAccount:AggregateId'])
    AggregateIdType(author, ['SpendingModel', 'author:AggregateId'])
    NonEmptyStringType(category, ['SpendingModel', 'category:String'])
    NonEmptyStringType(title, ['SpendingModel', 'title:String'])
    ZeroOrPositiveIntegerType(amount, ['SpendingModel', 'amount:Integer>=0'])
    BooleanType(booked, ['SpendingModel', 'booked:Boolean'])
    MaybeTimestampType(bookedAt, ['SpendingModel', 'bookedAt:Timestamp'])
    BooleanType(saving, ['SpendingModel', 'saving:Boolean'])
    this.checkingAccount = checkingAccount
    this.author = author
    this.category = category
    this.title = title
    this.amount = amount
    this.booked = booked
    this.bookedAt = bookedAt
    this.saving = saving
  }

  /**
   * Applies the event
   *
   * @param {ModelEvent} event
   */
  applyEvent (event) {
    let self = this
    let data = event.data
    switch (event.name) {
      case SpendingCreatedEvent:
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
      case SpendingDeletedEvent:
        self.deleted(event.createdAt)
        break
      case SpendingUpdatedEvent:
        for (let field in self) {
          if (self.hasOwnProperty(field) && data[field] !== undefined) {
            self[field] = data[field]
          }
        }
        this.updated(event.createdAt)
        break
      default:
        console.error('Unhandled SpendingModel event', event.name)
        throw new UnhandledDomainEventError(event.name)
    }
  }

  /**
   * @param {Object} data
   * @returns {ModelEvent}
   */
  update (data) {
    let self = this
    const updateData = {}
    // FIXME: Implement: paidWith
    let changed = false
    for (let field in self) {
      if (self.hasOwnProperty(field) && data[field] !== undefined && self[field] !== data[field]) {
        updateData[field] = data[field]
        self[field] = data[field]
        changed = true
      }
    }
    if (!changed) {
      throw new ValidationFailedError('Spending unchanged', data)
    }
    self.updated()
    return new ModelEvent(this.aggregateId(), SpendingUpdatedEvent, updateData)
  }

  /**
   * @param {PeriodicalModel} periodical
   * @param {Number} bookedAt
   * @return {SpendingModel}
   */
  static fromPeriodical (periodical, bookedAt) {
    PeriodicalModelType(periodical)
    TimestampType(bookedAt)
    const spending = new SpendingModel(
      periodical.checkingAccount,
      periodical.author,
      periodical.category,
      periodical.title,
      periodical.amount,
      false,
      bookedAt,
      periodical.saving
    )
    spending.periodical = periodical.aggregateId()
    return spending
  }
}
