import {ImmutableAggregateRoot, AggregateMeta, AggregateIdType} from '@rheactorjs/event-store'
import {CheckingAccountUserCreatedEvent} from '../events'
import {UnhandledDomainEventError} from '@rheactorjs/errors'

export class CheckingAccountUserModel extends ImmutableAggregateRoot {
  /**
   * @param {String} checkingAccount
   * @param {String} user
   * @param {AggregateMeta} meta
   * @throws TypeError
   */
  constructor (checkingAccount, user, meta) {
    super(meta)
    this.checkingAccount = AggregateIdType(checkingAccount, ['CheckingAccountUserModel()', 'checkingAccount:AggregateIdType'])
    this.user = AggregateIdType(user, ['CheckingAccountUserModel()', 'user:AggregateIdType'])
  }

  /**
   * Applies the event
   *
   * @param {ModelEvent} event
   * @param {CheckingAccountUserModel|undefined} checkingAccountUser
   * @return {CheckingAccountUserModel}
   * @throws UnhandledDomainEventError
   */
  static applyEvent (event, checkingAccountUser) {
    const {name, data: {checkingAccount, user}, createdAt, aggregateId} = event
    switch (name) {
      case CheckingAccountUserCreatedEvent:
        return new CheckingAccountUserModel(checkingAccount, user, new AggregateMeta(aggregateId, 1, createdAt))
      default:
        throw new UnhandledDomainEventError(event.name)
    }
  }
}
