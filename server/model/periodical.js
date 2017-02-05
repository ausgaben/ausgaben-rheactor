import {AggregateRoot, AggregateIdType} from 'rheactor-event-store'
import _reduce from 'lodash/reduce'
import {ValidationFailedError, UnhandledDomainEventError} from '@resourcefulhumans/rheactor-errors'
import {irreducible} from 'tcomb'
import {Boolean as BooleanType, Integer as IntegerType, String as StringType, refinement, maybe} from 'tcomb'
const NonEmptyStringType = refinement(StringType, s => s.length > 0, 'NonEmptyStringType')
const ZeroOrPositiveIntegerType = refinement(IntegerType, n => n >= 0, 'ZeroOrPositiveIntegerType')
const TimestampType = refinement(IntegerType, n => n > 0, 'TimestampType')
const MaybeTimestampType = maybe(TimestampType, 'MaybeTimestampType')

/**
 * @param {String} checkingAccount
 * @param {String} author
 * @param {String} category
 * @param {String} title
 * @param {Number} amount
 * @param {Boolean} estimate
 * @param {Number} startsAt
 * @param {Boolean} saving
 * @constructor
 * @throws ValidationFailedError if the creation fails due to invalid data
 */
export class PeriodicalModel extends AggregateRoot {
  constructor (checkingAccount, author, category, title, amount, estimate, startsAt, saving = false) {
    super()
    AggregateIdType(checkingAccount, ['PeriodicalModel', 'checkingAccount:AggregateId'])
    AggregateIdType(author, ['PeriodicalModel', 'author:AggregateId'])
    NonEmptyStringType(category, ['PeriodicalModel', 'category:String'])
    NonEmptyStringType(title, ['PeriodicalModel', 'title:String'])
    ZeroOrPositiveIntegerType(amount, ['PeriodicalModel', 'amount:Integer>=0'])
    BooleanType(estimate, ['PeriodicalModel', 'estimate:Boolean'])
    MaybeTimestampType(startsAt, ['PeriodicalModel', 'startsAt:Timestamp'])
    BooleanType(saving, ['PeriodicalModel', 'saving:Boolean'])
    this.checkingAccount = checkingAccount
    this.author = author
    this.category = category
    this.title = title
    this.amount = amount
    this.estimate = estimate
    this.startsAt = startsAt
    this.saving = saving
    this.enabledIn = _reduce(PeriodicalModel.monthFlags, (all, flag) => {
      return all | flag
    }, 0)
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
        self.startsAt = data.startsAt
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

  /**
   * Returns true if x is of type PeriodicalModel
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (x instanceof PeriodicalModel) || (
        x &&
        x.constructor &&
        x.constructor.name === PeriodicalModel.name &&
        'persisted' in x &&
        'updated' in x &&
        'deleted' in x &&
        'aggregateVersion' in x &&
        'aggregateId' in x &&
        'isDeleted' in x &&
        'createdAt' in x &&
        'modifiedAt' in x &&
        'updatedAt' in x &&
        'deletedAt' in x &&
        'checkingAccount' in x &&
        'author' in x &&
        'category' in x &&
        'title' in x &&
        'amount' in x &&
        'estimate' in x &&
        'startsAt' in x &&
        'enabledIn' in x &&
        'saving'
      )
  }
}

export const PeriodicalModelType = irreducible('PeriodicalModelType', PeriodicalModel.is)
