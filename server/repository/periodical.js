import {AggregateRepository, AggregateIndex, AggregateRelation, ModelEvent} from 'rheactor-event-store'
import {PeriodicalModel} from '../model/periodical'
import {PeriodicalCreatedEvent} from '../events'
import {Integer as IntegerType, refinement} from 'tcomb'
export const TimestampType = refinement(IntegerType, n => n > 0, 'TimestampType')

/**
 * Creates a new periodical repository
 *
 * @param {redis.client} redis
 * @constructor
 */
export class PeriodicalRepository extends AggregateRepository {
  constructor (redis) {
    super(PeriodicalModel, 'periodical', redis)
    this.relation = new AggregateRelation(this, redis)
  }

  /**
   * @param {PeriodicalModel} periodical
   */
  add (periodical) {
    const data = {
      checkingAccount: periodical.checkingAccount,
      author: periodical.author,
      category: periodical.category,
      title: periodical.title,
      amount: periodical.amount,
      estimate: periodical.estimate,
      startsAt: periodical.startsAt,
      enabledIn: periodical.enabledIn,
      saving: periodical.saving
    }
    return this.redis.incrAsync(`${this.aggregateAlias}:id`)
      .then((aggregateId) => {
        const event = new ModelEvent(aggregateId, PeriodicalCreatedEvent, data)
        return this.persistEvent(event)
          .then(() => this.relation.addRelatedId('checkingAccount', data.checkingAccount, aggregateId))
          .then(() => {
            periodical.applyEvent(event)
            return event
          })
      })
  }

  /**
   * Find all periodicals for a month
   *
   * @param {Number} timestamp
   */
  findByMonth (timestamp) {
    TimestampType(timestamp)
    const mask = PeriodicalModel.monthFlags[new Date(timestamp).getMonth()]
    return this.findAll()
      .filter((periodical) => {
        return periodical.enabledIn & mask
      })
  }
}
