'use strict'

let SpendingBookedAtIndex = require('../services/index/spending-bookedat')
let Promise = require('bluebird')

module.exports = {
  description: 'rebuild all search indices',
  action: (backend) => {
    let ss = new SpendingBookedAtIndex(backend.repositories, backend.redis.client, backend.emitter)
    return Promise.join(ss.index())
  }
}
