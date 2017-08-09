import moment from 'moment'
import forIn from 'lodash/forIn'

export default {
  name: 'report',
  arguments: '<account> <year> [title]',
  description: 'create a simple report',
  action: (backend, account, year, title) => {
    const report = {}
    return backend.repositories.checkingAccount.getById(account)
      .then(account => backend.repositories.spending.findByCheckingAccountId(account.meta.id))
      .filter(spending => spending.booked)
      .filter(spending => moment(new Date(spending.bookedAt)).isBetween(`${+year - 1}-12-31`, `${+year + 1}-01-01`, 'day'))
      .filter(spending => title ? spending.title.match(new RegExp(title, 'i')) : true)
      .map(spending => {
        let label = title ? spending.title : spending.category
        if (report[label] === undefined) {
          report[label] = 0
        }
        report[label] += spending.amount
      })
      .then(() => {
        forIn(report, (v, k) => {
          console.log(`${k}\t${v / 100}`)
        })
      })
  }
}
