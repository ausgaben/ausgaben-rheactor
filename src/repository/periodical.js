import {ImmutableAggregateRepository, AggregateRelation} from '@rheactorjs/event-store'
import {PeriodicalModel} from '../model/periodical'
import {Date as DateType} from 'tcomb'

/**
 * Creates a new periodical repository
 *
 * @param {redis.client} redis
 * @constructor
 */
export class PeriodicalRepository extends ImmutableAggregateRepository {
  constructor (redis) {
    super(PeriodicalModel, 'periodical', redis)
    this.relation = new AggregateRelation(this, redis)
  }

  /**
   * @param {object} periodical
   */
  add (periodical) {
    const data = {
      checkingAccount: periodical.checkingAccount,
      author: periodical.author,
      category: periodical.category,
      title: periodical.title,
      amount: periodical.amount,
      estimate: periodical.estimate,
      startsAt: periodical.startsAt ? periodical.startsAt.toISOString() : undefined,
      enabledIn: periodical.enabledIn,
      saving: periodical.saving
    }
    return super.add(data)
      .then(event => this.relation.addRelatedId('checkingAccount', data.checkingAccount, event.aggregateId)
        .then(() => event)
      )
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
      .filter(({enabledIn}) => enabledIn & mask)
  }
}
