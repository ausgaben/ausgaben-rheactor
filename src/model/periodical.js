import {AggregateRoot, AggregateIdType} from '@rheactorjs/event-store'
import {UnhandledDomainEventError} from '@rheactorjs/errors'
import {
  irreducible,
  Boolean as BooleanType,
  Integer as IntegerType,
  String as StringType,
  refinement,
  maybe,
  Date as DateType
} from 'tcomb'
const NonEmptyStringType = refinement(StringType, s => s.length > 0, 'NonEmptyStringType')
const MaybeDateType = maybe(DateType, 'MaybeDateType')

/**
 * @param {String} checkingAccount
 * @param {String} author
 * @param {String} category
 * @param {String} title
 * @param {Number} amount
 * @param {Boolean} estimate
 * @param {Date} startsAt
 * @param {Number} enabledIn
 * @param {Boolean} saving
 * @constructor
 * @throws ValidationFailedError if the creation fails due to invalid data
 */
export class PeriodicalModel extends AggregateRoot {
  constructor (checkingAccount, author, category, title, amount, estimate, startsAt, enabledIn, saving = false) {
    super()
    this.checkingAccount = AggregateIdType(checkingAccount, ['PeriodicalModel', 'checkingAccount:AggregateId'])
    this.author = AggregateIdType(author, ['PeriodicalModel', 'author:AggregateId'])
    this.category = NonEmptyStringType(category, ['PeriodicalModel', 'category:String'])
    this.title = NonEmptyStringType(title, ['PeriodicalModel', 'title:String'])
    this.amount = IntegerType(amount, ['PeriodicalModel', 'amount:Integer'])
    this.estimate = BooleanType(estimate, ['PeriodicalModel', 'estimate:Boolean'])
    this.startsAt = MaybeDateType(startsAt, ['PeriodicalModel', 'startsAt:Date'])
    this.enabledIn = IntegerType(enabledIn || PeriodicalModel.monthFlags.reduce((all, flag) => all | flag, 0), ['PeriodicalModel', 'enabledIn:Integer'])
    this.saving = BooleanType(saving, ['PeriodicalModel', 'saving:Boolean'])
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
      case 'PeriodicalCreatedEvent':
        self.checkingAccount = data.checkingAccount
        self.author = data.author
        self.category = data.category
        self.title = data.title
        self.amount = data.amount
        self.estimate = data.estimate
        self.startsAt = data.startsAt ? new Date(data.startsAt) : undefined
        self.enabledIn = data.enabledIn
        self.saving = data.saving
        this.persisted(event.aggregateId, event.createdAt)
        break
      default:
        console.error('Unhandled SpendingModel event', event.name)
        throw new UnhandledDomainEventError(event.name)
    }
  }

  static get monthFlags () {
    return [
      1,
      2,
      4,
      8,
      16,
      32,
      64,
      128,
      256,
      512,
      1024,
      2048
    ]
  }
}

export const PeriodicalModelType = irreducible('PeriodicalModelType', x => x instanceof PeriodicalModel)
