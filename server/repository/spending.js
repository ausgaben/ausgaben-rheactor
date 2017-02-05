import {AggregateRepository, AggregateIndex, AggregateRelation, ModelEvent} from 'rheactor-event-store'
import {SpendingModel} from '../model/spending'
import {SpendingCreatedEvent, SpendingDeletedEvent} from '../events'

/**
 * Creates a new spending repository
 *
 * @param {redis.client} redis
 * @constructor
 */
export class SpendingRepository extends AggregateRepository {
  constructor (redis) {
    super(SpendingModel, 'spending', redis)
    this.relation = new AggregateRelation(this, redis)
  }

  /**
   * @param {SpendingModel} spending
   */
  add (spending) {
    const data = {
      checkingAccount: spending.checkingAccount,
      author: spending.author,
      category: spending.category,
      title: spending.title,
      amount: spending.amount,
      booked: spending.booked,
      saving: spending.saving
    }
    if (spending.bookedAt) {
      data.bookedAt = spending.bookedAt
    }
    return this.redis.incrAsync(`${this.aggregateAlias}:id`)
      .then((aggregateId) => {
        const event = new ModelEvent(aggregateId, SpendingCreatedEvent, data)
        return this.persistEvent(event)
          .then(() => this.relation.addRelatedId('checkingAccount', data.checkingAccount, aggregateId))
          .then(() => {
            spending.applyEvent(event)
            return event
          })
      })
  }

  /**
   * Deletes a Spending
   *
   * @param {SpendingModel} spending
   * @param {UserModel} author
   * @return {Promise.<SpendingDeletedEvent>}
   */
  remove (spending, author) {
    const event = new ModelEvent(spending.aggregateId(), SpendingDeletedEvent, {}, new Date(), author.aggregateId())
    return this.persistEvent(event)
      .then(() => this.relation.removeRelatedId('checkingAccount', spending.checkingAccount, spending.aggregateId()))
      .then(() => {
        spending.applyEvent(event)
        return event
      })
  }

  findByCheckingAccountId (checkingAccountId) {
    return this.relation.findByRelatedId('checkingAccount', checkingAccountId)
  }
}
