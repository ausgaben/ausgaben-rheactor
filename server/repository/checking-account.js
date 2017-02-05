import {AggregateRepository} from 'rheactor-event-store'
import {CheckingAccountModel} from '../model/checking-account'

/**
 * Creates a new checkingAccount repository
 *
 * @param {redis.client} redis
 * @constructor
 */
export class CheckingAccountRepository extends AggregateRepository {
  constructor (redis) {
    super(CheckingAccountModel, 'checkingAccount', redis)
  }
}
