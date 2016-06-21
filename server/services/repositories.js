'use strict'

const UserRepository = require('../repository/account-repository')

module.exports = (redis) => {
  let user = new UserRepository(redis)
  return {
    user
  }
}
