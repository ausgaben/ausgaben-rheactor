'use strict'

const CheckingAccountRepository = require('../repository/checking-account')
const CheckingAccountUserRepository = require('../repository/checking-account-user')
const PeriodicalRepository = require('../repository/periodical')
const SpendingRepository = require('../repository/spending')
const UserRepository = require('rheactor-server/repository/user-repository')

module.exports = (redis) => {
  return {
    user: new UserRepository(redis),
    checkingAccount: new CheckingAccountRepository(redis),
    checkingAccountUser: new CheckingAccountUserRepository(redis),
    periodical: new PeriodicalRepository(redis),
    spending: new SpendingRepository(redis)
  }
}
