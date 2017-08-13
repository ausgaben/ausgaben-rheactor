import {ImmutableAggregateRepository} from '@rheactorjs/event-store'
import {CheckingAccountModel} from '../model/checking-account'

/**
 * Creates a new checkingAccount repository
 *
 * @param {redis.client} redis
 * @constructor
 */
export class CheckingAccountRepository extends ImmutableAggregateRepository {
  constructor (redis) {
    super(CheckingAccountModel, 'checkingAccount', redis)
  }
}
