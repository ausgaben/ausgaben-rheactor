import {AggregateRoot, AggregateIdType} from 'rheactor-event-store'
import {CheckingAccountUserCreatedEvent} from '../events'
import {UnhandledDomainEventError} from '@resourcefulhumans/rheactor-errors'

/**
 * @param {String} checkingAccount
 * @param {String} user
 * @constructor
 * @throws ValidationFailedError if the creation fails due to invalid data
 */
export class CheckingAccountUserModel extends AggregateRoot {
  constructor (checkingAccount, user) {
    super()
    AggregateIdType(checkingAccount)
    AggregateIdType(user)
    this.checkingAccount = checkingAccount
    this.user = user
  }

  /**
   * Applies the event
   *
   * @param {ModelEvent} event
   */
  applyEvent (event) {
    const data = event.data
    switch (event.name) {
      case CheckingAccountUserCreatedEvent:
        this.checkingAccount = data.checkingAccount
        this.user = data.user
        this.persisted(event.aggregateId, event.createdAt)
        break
      default:
        console.error('Unhandled CheckingAccountUserModel event', event.name)
        throw new UnhandledDomainEventError(event.name)
    }
  }
}
