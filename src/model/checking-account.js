import {ValidationFailedError, UnhandledDomainEventError} from '@rheactorjs/errors'
import {ImmutableAggregateRoot, ModelEvent, AggregateMeta} from '@rheactorjs/event-store'
import {CheckingAccountPropertyChangedEvent, CheckingAccountCreatedEvent} from '../events'
import {Boolean as BooleanType, String as StringType, refinement} from 'tcomb'

const NonEmptyStringType = refinement(StringType, s => s.length > 0, 'NonEmptyStringType')

export class CheckingAccountModel extends ImmutableAggregateRoot {
  /**
   * @param {String} name
   * @param {Boolean} monthly
   * @param {Boolean} savings
   * @param {AggregateMeta} meta
   * @throws TypeError if the creation fails due to invalid data
   */
  constructor (name, monthly = false, savings = false, meta) {
    super(meta)
    this.name = NonEmptyStringType(name, ['CheckingAccountModel()', 'name:String'])
    this.monthly = BooleanType(monthly, ['CheckingAccountModel()', 'monthly:Boolean'])
    this.savings = BooleanType(savings, ['CheckingAccountModel()', 'savings:Boolean'])
  }

  /**
   * Applies the event
   *
   * @param {ModelEvent} event
   * @param {CheckingAccountModel|undefined} checkingAccount
   * @return {CheckingAccountModel}
   * @throws UnhandledDomainEventError
   */
  static applyEvent (event, checkingAccount) {
    const {data: {name, monthly, savings, property, value}, createdAt, aggregateId} = event
    switch (event.name) {
      case CheckingAccountCreatedEvent:
        return new CheckingAccountModel(name, monthly, savings, new AggregateMeta(aggregateId, 1, createdAt))
      case CheckingAccountPropertyChangedEvent:
        const d = {
          name: checkingAccount.name,
          monthly: checkingAccount.monthly,
          savings: checkingAccount.savings
        }
        d[property] = value
        return new CheckingAccountModel(d.name, d.monthly, d.savings, checkingAccount.meta.updated(createdAt))
      default:
        throw new UnhandledDomainEventError(event.name)
    }
  }

  /**
   * @param  {boolean} monthly
   * @returns {ModelEvent}
   * @throws ValidationFailedError
   * @throws TypeError
   */
  setMonthly (monthly = false) {
    BooleanType(monthly, ['CheckingAccountModel.setMonthly()', 'monthly:Boolean'])
    if (this.monthly === monthly) {
      throw new ValidationFailedError('Monthly unchanged', monthly)
    }
    return new ModelEvent(this.meta.id, CheckingAccountPropertyChangedEvent, {property: 'monthly', value: monthly})
  }

  /**
   * @param  {boolean} savings
   * @returns {ModelEvent}
   * @throws ValidationFailedError
   * @throws TypeError
   */
  setSavings (savings = false) {
    BooleanType(savings, ['CheckingAccountModel.setSavings()', 'savings:Boolean'])
    if (this.savings === savings) {
      throw new ValidationFailedError('Savings unchanged', savings)
    }
    return new ModelEvent(this.meta.id, CheckingAccountPropertyChangedEvent, {property: 'savings', value: savings})
  }
}
