import {SpendingCreatedEvent, SpendingUpdatedEvent, SpendingDeletedEvent} from '../../events'
import {EntityDeletedError} from '@resourcefulhumans/rheactor-errors'
import t from 'tcomb'
const PositiveIntegerType = t.refinement(t.Number, (n) => n % 1 === 0 && n > 0, 'PositiveInteger')
const scalarType = t.union([t.String, t.Number])

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
    const self = this
    t.Object(repositories)
    t.Object(redis)
    t.Object(emitter)
    this.repositories = repositories
    this.redis = redis

    emitter.on(
      emitter.toEventName(SpendingCreatedEvent),
      event => repositories.spending.getById(event.aggregateId).then(spending => self.indexSpending(spending))
    )
    emitter.on(
      emitter.toEventName(SpendingDeletedEvent),
      event => repositories.spending.getById(event.aggregateId)
        .catch(err => EntityDeletedError.is(err), err => self.removeSpending(err.entry))
    )
    emitter.on(
      emitter.toEventName(SpendingUpdatedEvent),
      event => {
        if (event.data.bookedAt) {
          return repositories.spending.getById(event.aggregateId).then(spending => self.indexSpending(spending))
        }
      }
    )
  }

  index () {
    let self = this
    return self.repositories.checkingAccount.findAll()
      .map(checkingAccount => self.redis.delAsync(self.indexKey(checkingAccount.aggregateId())))
      .then(() => self.repositories.spending.findAll()
        .map(spending => self.indexSpending(spending))
      )
  }

  indexKey (checkingAccount) {
    scalarType(checkingAccount)
    return `checkingAccount:spending-bookedAt:${checkingAccount}`
  }

  /**
   * @param {SpendingModel} spending
   * @return {Promise}
   */
  indexSpending (spending) {
    t.Object(spending)
    const self = this
    if (!spending.bookedAt) return
    const score = spending.bookedAt
    return self.redis.zaddAsync(self.indexKey(spending.checkingAccount), score, spending.aggregateId())
  }

  /**
   * @param {SpendingModel} spending
   * @return {Promise}
   */
  removeSpending (spending) {
    t.Object(spending)
    const self = this
    return self.redis.zremAsync(`checkingAccount:spending-bookedAt:${spending.checkingAccount}`, spending.aggregateId())
  }

  /**
   * @param {Number} checkingAccount
   * @param {Number} dateFrom
   * @param {Number} dateTo
   * @return {Promise.<Array.<Number>>}
   */
  range (checkingAccount, dateFrom, dateTo) {
    scalarType(checkingAccount)
    t.maybe(PositiveIntegerType)(dateFrom)
    t.maybe(PositiveIntegerType)(dateTo)
    if (!dateTo) dateTo = '+inf'
    if (!dateFrom) dateFrom = '-inf'
    const self = this
    return self.redis.zrangebyscoreAsync(`checkingAccount:spending-bookedAt:${checkingAccount}`, `${dateFrom}`, `${dateTo}`)
  }
}

export default SpendingBookedAtIndex
