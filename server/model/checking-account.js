import {ValidationFailedError, UnhandledDomainEventError} from '@resourcefulhumans/rheactor-errors'
import {AggregateRoot, ModelEvent} from 'rheactor-event-store'
import {CheckingAccountPropertyChangedEvent, CheckingAccountCreatedEvent} from '../events'
import {Boolean as BooleanType, Integer as IntegerType, String as StringType, refinement, maybe} from 'tcomb'

const NonEmptyStringType = refinement(StringType, s => s.length > 0, 'NonEmptyStringType')

/**
 * @param {String} name
 * @param {Boolean} monthly
 * @param {Boolean} savings
 * @constructor
 * @throws ValidationFailedError if the creation fails due to invalid data
 */
export class CheckingAccountModel extends AggregateRoot {
  constructor (name, monthly = false, savings = false) {
    super()
    NonEmptyStringType(name)
    BooleanType(monthly)
    BooleanType(savings)
    this.name = name
    this.monthly = monthly
    this.savings = savings
  }

  /**
   * Applies the event
   *
   * @param {ModelEvent} event
   */
  applyEvent (event) {
    const data = event.data
    switch (event.name) {
      case CheckingAccountCreatedEvent:
        this.name = data.name
        this.monthly = data.monthly
        this.savings = data.savings
        this.persisted(event.aggregateId, event.createdAt)
        break
      case CheckingAccountPropertyChangedEvent:
        this[data.property] = data.value
        this.updated(event.createdAt)
        break
      default:
        console.error('Unhandled CheckingAccountModel event', event.name)
        throw new UnhandledDomainEventError(event.name)
    }
  }

  /**
   * @param  {boolean} monthly
   * @returns {ModelEvent}
   */
  setMonthly (monthly = false) {
    if (this.monthly === monthly) {
      throw new ValidationFailedError('Monthly unchanged', monthly)
    }
    this.monthly = monthly
    this.updated()
    return new ModelEvent(this.aggregateId(), CheckingAccountPropertyChangedEvent, {
      property: 'monthly',
      value: monthly
    })
  }

  /**
   * @param  {boolean} savings
   * @returns {SpendingUpdatedEvent}
   */
  setSavings (savings = false) {
    if (this.savings === savings) {
      throw new ValidationFailedError('Savings unchanged', savings)
    }
    this.savings = savings
    this.updated()
    return new ModelEvent(this.aggregateId(), CheckingAccountPropertyChangedEvent, {
      property: 'savings',
      value: savings
    })
  }
}
