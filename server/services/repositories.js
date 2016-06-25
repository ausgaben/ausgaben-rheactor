'use strict'

const AccountRepository = require('../repository/account')
const PeriodicalRepository = require('../repository/periodical')
const SpendingRepository = require('../repository/spending')
const UserRepository = require('rheactor-server/repository/user-repository')

module.exports = (redis) => {
  let user = new UserRepository(redis)
  return {
    user
  }
}
