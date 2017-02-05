export default {
  description: 'list all accounts',
  action: (backend) => {
    return backend.repositories.checkingAccount.findAll()
      .map((account) => {
        console.log('-', account.aggregateId(), account.name)
      })
  }
}
