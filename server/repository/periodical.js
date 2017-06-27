import {AggregateRepository, AggregateRelation, ModelEvent} from '@rheactorjs/event-store'
import {PeriodicalModel} from '../model/periodical'
import {PeriodicalCreatedEvent} from '../events'
import {Date as DateType} from 'tcomb'

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
   * @param {Date} date
   */
  findByMonth (date) {
    DateType(date, ['PeriodicalRepository', 'findByMonth()', 'date:Date'])
    const mask = PeriodicalModel.monthFlags[date.getMonth()]
    return this.findAll()
      .filter((periodical) => {
        return periodical.enabledIn & mask
      })
  }
}
