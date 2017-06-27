import {SpendingCreatedEvent, SpendingUpdatedEvent, SpendingDeletedEvent} from '../../events'
import {EntryDeletedError} from '@rheactorjs/errors'
import {Date as DateType, Object as ObjectType} from 'tcomb'
import {AggregateIdType} from '@rheactorjs/event-store'
import {SpendingModelType} from '../../model/spending'

/**
 * Maintains an index to sort spendings by bookedAt
 *
 * @param repositories
 * @param redis
 * @param {BackendEmitter} emitter
 * @constructor
 */
class SpendingBookedAtIndex {
  constructor (repositories, redis, emitter) {
    ObjectType(repositories)
    ObjectType(redis)
    ObjectType(emitter)
    this.repositories = repositories
    this.redis = redis

    emitter.on(
      emitter.toEventName(SpendingCreatedEvent),
      event => repositories.spending.getById(event.aggregateId).then(spending => this.indexSpending(spending))
    )
    emitter.on(
      emitter.toEventName(SpendingDeletedEvent),
      event => repositories.spending.getById(event.aggregateId)
        .catch(err => EntryDeletedError.is(err), err => this.removeSpending(err.entry))
    )
    emitter.on(
      emitter.toEventName(SpendingUpdatedEvent),
      event => {
        if (event.data.bookedAt) {
          return repositories.spending.getById(event.aggregateId).then(spending => this.indexSpending(spending))
        }
      }
    )
  }

  index () {
    return this.repositories.checkingAccount.findAll()
      .map(checkingAccount => this.redis.delAsync(this.indexKey(checkingAccount.aggregateId())))
      .then(() => this.repositories.spending.findAll()
        .map(spending => this.indexSpending(spending))
      )
  }

  indexKey (checkingAccount) {
    AggregateIdType(checkingAccount)
    return `checkingAccount:spending-bookedAt:${checkingAccount}`
  }

  /**
   * @param {SpendingModel} spending
   * @return {Promise}
   */
  indexSpending (spending) {
    SpendingModelType(spending)
    if (!spending.bookedAt) return
    const score = spending.bookedAt.getTime()
    return this.redis.zaddAsync(this.indexKey(spending.checkingAccount), score, spending.aggregateId())
  }

  /**
   * @param {SpendingModel} spending
   * @return {Promise}
   */
  removeSpending (spending) {
    SpendingModelType(spending)
    return this.redis.zremAsync(`checkingAccount:spending-bookedAt:${spending.checkingAccount}`, spending.aggregateId())
  }

  /**
   * @param {Number} checkingAccount
   * @param {Date} dateFrom
   * @param {Date} dateTo
   * @return {Promise.<Array.<Number>>}
   */
  range (checkingAccount, dateFrom, dateTo) {
    AggregateIdType(checkingAccount)
    const from = dateFrom ? DateType(dateFrom).getTime() : '-inf'
    const to = dateTo ? DateType(dateTo).getTime() : '+inf'
    return this.redis.zrangebyscoreAsync(`checkingAccount:spending-bookedAt:${checkingAccount}`, `${from}`, `${to}`)
  }
}

export default SpendingBookedAtIndex
