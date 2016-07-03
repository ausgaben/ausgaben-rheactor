'use strict'

module.exports = (app) => {
  require('./checking-account')(app)
  require('./spendings')(app)
}
