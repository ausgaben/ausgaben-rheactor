import {CheckingAccountRepository} from '../repository/checking-account'
import {CheckingAccountUserRepository} from '../repository/checking-account-user'
import {PeriodicalRepository} from '../repository/periodical'
import {SpendingRepository} from '../repository/spending'
import {UserRepository} from '@rheactorjs/server'

export default (redis) => {
  return {
    user: new UserRepository(redis),
    checkingAccount: new CheckingAccountRepository(redis),
    checkingAccountUser: new CheckingAccountUserRepository(redis),
    periodical: new PeriodicalRepository(redis),
    spending: new SpendingRepository(redis)
  }
}
