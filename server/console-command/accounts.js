'use strict'

module.exports = {
  description: 'list all accounts',
  options: [
    ['-j, --json', 'format as JSON on stderr']
  ],
  action: (backend, {json}) => {
    return backend.repositories.checkingAccount.findAll()
      .then((accounts) => {
        if (json) {
          console.error(JSON.stringify(accounts.map(account => ({
            id: account.aggregateId(),
            name: account.name
          }))))
        } else {
          accounts.forEach(account => {
            console.log('-', account.aggregateId(), account.name)
          })
        }
      })
  }
}
