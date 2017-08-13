import {ImmutableAggregateRepository, AggregateRelation} from '@rheactorjs/event-store'
import {SpendingModel} from '../model/spending'

/**
 * Creates a new spending repository
 *
 * @param {redis.client} redis
 * @constructor
 */
export class SpendingRepository extends ImmutableAggregateRepository {
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
    return super.add(data)
      .then(event => this.relation.addRelatedId('checkingAccount', data.checkingAccount, event.aggregateId)
        .then(() => event)
      )
  }

  /**
   * Deletes a Spending
   *
   * @param {SpendingModel} spending
   * @param {UserModel} author
   * @return {Promise.<SpendingDeletedEvent>}
   */
  remove (spending, author) {
    return super.remove(spending.meta.id, author.meta.id)
      .then(event => this.relation.removeRelatedId('checkingAccount', spending.checkingAccount, spending.meta.id)
        .then(() => event)
      )
  }

  findByCheckingAccountId (checkingAccountId) {
    return this.relation.findByRelatedId('checkingAccount', checkingAccountId)
  }
}
