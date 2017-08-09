import {ImmutableAggregateRoot, ModelEvent, AggregateIdType, AggregateMeta} from '@rheactorjs/event-store'
import {PeriodicalModelType} from './periodical'
import {UnhandledDomainEventError} from '@rheactorjs/errors'
import {SpendingCreatedEvent, SpendingUpdatedEvent, SpendingDeletedEvent} from '../events'
import {Boolean as BooleanType, Integer as IntegerType, String as StringType, refinement, maybe, Date as DateType, irreducible} from 'tcomb'

const NonEmptyStringType = refinement(StringType, s => s.length > 0, 'NonEmptyStringType')
const MaybeDateType = maybe(DateType, 'MaybeDateType')

export class SpendingModel extends ImmutableAggregateRoot {
  /**
   * @param {String} checkingAccount
   * @param {String} author
   * @param {String} category
   * @param {String} title
   * @param {Number} amount
   * @param {Boolean} booked
   * @param {Date} bookedAt
   * @param {Boolean} saving
   * @param {AggregateMeta} meta
   * @throws TypeError if the creation fails due to invalid data
   */
  constructor (checkingAccount, author, category, title, amount, booked = false, bookedAt, saving = false, meta) {
    super(meta)
    this.checkingAccount = AggregateIdType(checkingAccount, ['SpendingModel', 'checkingAccount:AggregateId'])
    this.author = AggregateIdType(author, ['SpendingModel', 'author:AggregateId'])
    this.category = NonEmptyStringType(category, ['SpendingModel', 'category:String'])
    this.title = NonEmptyStringType(title, ['SpendingModel', 'title:String'])
    this.amount = IntegerType(amount, ['SpendingModel', 'amount:Integer'])
    this.booked = BooleanType(booked, ['SpendingModel', 'booked:Boolean'])
    this.bookedAt = MaybeDateType(bookedAt, ['SpendingModel', 'Date:Date'])
    this.saving = BooleanType(saving, ['SpendingModel', 'saving:Boolean'])
  }

  /**
   * Applies the event
   *
   * @param {ModelEvent} event
   * @param {SpendingModel|undefined} spending
   * @return {SpendingModel}
   */
  static applyEvent (event, spending) {
    const {name, data: {checkingAccount, author, category, title, amount, booked, bookedAt, saving}, createdAt, aggregateId} = event
    switch (name) {
      case SpendingCreatedEvent:
        return new SpendingModel(checkingAccount, author, category, title, amount, booked, bookedAt ? new Date(bookedAt) : undefined, saving, new AggregateMeta(aggregateId, 1, createdAt))
      case SpendingDeletedEvent:
        return new SpendingModel(spending.checkingAccount, spending.author, spending.category, spending.title, spending.amount, spending.booked, spending.bookedAt, spending.saving, spending.meta.deleted(createdAt))
      case SpendingUpdatedEvent:
        const d = {
          checkingAccount, author, category, title, amount, booked, bookedAt, saving
        }
        return new SpendingModel(d.checkingAccount, d.author, d.category, d.title, d.amount, d.booked, d.bookedAt, d.saving, spending.meta.updated(createdAt))
      default:
        throw new UnhandledDomainEventError(event.name)
    }
  }

  /**
   * @param {Object} data
   * @returns {ModelEvent}
   */
  update (data) {
    const {checkingAccount, author, category, title, amount, booked, bookedAt, saving} = data
    return new ModelEvent(this.meta.id, SpendingUpdatedEvent, {checkingAccount, author, category, title, amount, booked, bookedAt: bookedAt ? bookedAt.toISOString() : undefined, saving}, new Date())
  }

  /**
   * @param {PeriodicalModel} periodical
   * @param {Number} bookedAt
   * @return {SpendingModel}
   */
  static fromPeriodical (periodical, bookedAt) {
    PeriodicalModelType(periodical)
    DateType(bookedAt)
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
    spending.periodical = periodical.meta.id
    return spending
  }
}

export const SpendingModelType = irreducible('SpendingModelType', x => x instanceof SpendingModel)
