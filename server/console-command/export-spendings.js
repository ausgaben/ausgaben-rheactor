'use strict'

module.exports = {
  description: 'export spendings',
  action: (backend) => backend.repositories.checkingAccount.findAll()
    .map(account => backend.repositories.spending.findByCheckingAccountId(account.aggregateId()))
    .then(spendings => {
      console.error(JSON.stringify(spendings.reduce(
        (spendings, all) => ([
          ...spendings,
          ...all
        ]), []))
      )
    })
}
