'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const CreateSpendingCommand = require('../command/spending/create')

module.exports = {
  arguments: '<importfile> <account> <user> <month>',
  description: 'import spendings from a tab-separated file',
  action: (backend, importfile, account, user, month) => {
    const bookedAt = new Date()
    bookedAt.setMonth(parseInt(month, 10) - 1, 1)
    return Promise
      .join(
        backend.repositories.checkingAccount.getById(account),
        backend.repositories.user.getById(user),
        fs.readFileAsync(importfile, 'utf8')
      )
      .spread((checkingAccount, author, data) => Promise.map(data.split('\n'), line => {
        const fields = line.split('\t')
        if (fields.length < 4) return
        const type = fields[0]
        const category = fields[1]
        const title = fields[2]
        const amount = Math.round(parseFloat(fields[3].replace(',', '.')) * 100)
        return backend.emitter.emit(new CreateSpendingCommand(checkingAccount, category, title, amount, false, bookedAt.getTime(), type === 'Vorsorge', author))
      }))
  }
}
