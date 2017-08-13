import {ImmutableAggregateRepository, AggregateRelation, AggregateIndex, AggregateIdType} from '@rheactorjs/event-store'
import {CheckingAccountUserModel} from '../model/checking-account-user'

/**
 * Creates a new CheckingAccountUser repository
 *
 * @param {redis.client} redis
 * @constructor
 */
export class CheckingAccountUserRepository extends ImmutableAggregateRepository {
  constructor (redis) {
    super(CheckingAccountUserModel, 'checkingAccountUser', redis)
    this.index = new AggregateIndex(this.alias, redis)
    this.relation = new AggregateRelation(this, redis)
  }

  /**
   * @param {CheckingAccountUserModel} checkingAccountUserModel
   * @returns {Promise.<CheckingAccountUserCreatedEvent>}
   */
  add (checkingAccount, user) {
    AggregateIdType(checkingAccount, ['CheckingAccountUserRepository.add()', 'account:AggregateIdType'])
    AggregateIdType(user, ['CheckingAccountUserRepository.add()', 'user:AggregateIdType'])
    return this.index.addToListIfNotPresent(`user-checkingAccounts:${user}`, checkingAccount)
      .then(() => super.add({user, checkingAccount})
        .then(event => this.relation.addRelatedId('checkingAccount', checkingAccount, event.aggregateId)
          .then(() => event)
        )
      )
  }

  findByCheckingAccountId (checkingAccountId) {
    return this.relation.findByRelatedId('checkingAccount', checkingAccountId)
  }
}
