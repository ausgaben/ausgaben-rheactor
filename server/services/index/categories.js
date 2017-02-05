import {SpendingCreatedEvent, SpendingUpdatedEvent} from '../../events'
import t from 'tcomb'
const scalarType = t.union([t.String, t.Number])

/**
 * Maintains an index of categories in use for autocompletion
 *
 * @param repositories
 * @param redis
 * @param {BackendEmitter} emitter
 * @constructor
 */
class CategoriesIndex {
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
      emitter.toEventName(SpendingUpdatedEvent),
      event => {
        if (event.data.category) {
          return repositories.spending.getById(event.aggregateId).then(spending => self.indexSpending(spending))
        }
      }
    )
  }

  index () {
    let self = this
    return self.repositories.spending.findAll()
      .map(spending => self.indexSpending(spending))
  }

  /**
   * @param {SpendingModel} spending
   * @return {Promise}
   */
  indexSpending (spending) {
    t.Object(spending)
    const self = this
    return self.redis.saddAsync(`spending-categories:${spending.checkingAccount}`, spending.category)
  }

  /**
   * @param {Number} checkingAccount
   * @return {Promise.<Array.<String>>}
   */
  all (checkingAccount) {
    scalarType(checkingAccount)
    const self = this
    return self.redis.smembersAsync(`spending-categories:${checkingAccount}`)
  }
}

export default CategoriesIndex
