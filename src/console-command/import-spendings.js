import Promise from 'bluebird'
import CreateSpendingCommand from '../command/spending/create'
import moment from 'moment'
import {readFile} from 'fs'
import {promisify} from 'util'

export default {
  name: 'import-spendings',
  arguments: '<importfile> <account> <user> <month>',
  description: 'import spendings from a tab-separated file',
  action: (backend, importfile, account, user, month) => {
    const bookedAt = new Date()
    month = parseInt(month, 10)
    bookedAt.setMonth(month - 1, 1)
    if (month < moment().month() + 1) {
      bookedAt.setYear(moment().year() + 1)
    }
    return Promise
      .join(
        backend.repositories.checkingAccount.getById(account),
        backend.repositories.user.getById(user),
        promisify(readFile)(importfile, 'utf8')
      )
      .spread((checkingAccount, author, data) => Promise.map(data.split('\n'), line => {
        const fields = line.split('\t')
        if (fields.length < 4) return
        const type = fields[0]
        const category = fields[1]
        const title = fields[2]
        const amount = Math.round(parseFloat(fields[3].replace(',', '.')) * 100)
        return backend.emitter.emit(new CreateSpendingCommand(checkingAccount, category, title, amount, false, bookedAt, type === 'Vorsorge', author))
      }))
  }
}
