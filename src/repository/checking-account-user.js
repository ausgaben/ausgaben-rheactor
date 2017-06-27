import {AggregateRepository, AggregateIndex, AggregateRelation} from '@rheactorjs/event-store'
import {CheckingAccountUserModel} from '../model/checking-account-user'

/**
 * Creates a new CheckingAccountUser repository
 *
 * @param {redis.client} redis
 * @constructor
 */
export class CheckingAccountUserRepository extends AggregateRepository {
  constructor (redis) {
    super(CheckingAccountUserModel, 'checkingAccountUser', redis)
    this.index = new AggregateIndex(this.aggregateAlias, redis)
    this.relation = new AggregateRelation(this, redis)
  }

  /**
   * @param {CheckingAccountUserModel} checkingAccountUserModel
   * @returns {Promise.<CheckingAccountUserCreatedEvent>}
   */
  add (checkingAccountUserModel) {
    return this.index.addToListIfNotPresent(`user-checkingAccounts:${checkingAccountUserModel.user}`, checkingAccountUserModel.checkingAccount)
      .then(() => super.add(checkingAccountUserModel)
        .then((event) => this.relation.addRelatedId('checkingAccount', checkingAccountUserModel.checkingAccount, event.aggregateId)
          .then(() => event)
        )
      )
  }

  findByCheckingAccountId (checkingAccountId) {
    return this.relation.findByRelatedId('checkingAccount', checkingAccountId)
  }
}
