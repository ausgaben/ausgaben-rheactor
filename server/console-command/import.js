import path from 'path'
import UserCreateCmd from '@rheactorjs/server/console-command/user-create'
import CreateCheckingAccountCommand from '../command/checking-account/create'
import CreateCheckingAccountUserCommand from '../command/checking-account-user/create'
import CreateSpendingCommand from '../command/spending/create'
import Promise from 'bluebird'
import {EmailValue} from '@rheactorjs/value-objects'
import _filter from 'lodash/filter'
import _padStart from 'lodash/padStart'

export default {
  arguments: '<importfile>',
  description: 'import ausgaben 1.0 export created with phpMyAdmin JSON export',
  action: (backend, importfile) => {
    const importData = require(path.normalize(path.join(process.cwd(), importfile)))
    const userId2newId = {}
    const userId2newEntity = {}
    const accountId2newId = {}
    const accountId2newEntity = {}
    // Import users
    return Promise
      .map(
        importData.users,
        userData => UserCreateCmd.action(backend, userData.email, userData.prename, userData.name)
          .then(
            () => backend.repositories.user
              .getByEmail(new EmailValue(userData.email))
              .then(user => {
                userId2newId[userData.user_id] = user.aggregateId()
                userId2newEntity[userData.user_id] = user
                return user
              })
          )
      )
      .then(() => {
        // Import checking accounts
        return Promise
          .map(
            importData.accounts, accountData => {
              const user2accounts = _filter(importData.user2account, user2account => user2account.account_id === accountData.account_id)
              const ownerRelation = user2accounts.shift()
              return backend.emitter.emit(new CreateCheckingAccountCommand(accountData.name, accountData.summarize_months === '1', false, userId2newEntity[ownerRelation.user_id]))
                .then(event => backend.repositories.checkingAccount.getById(event.aggregateId)
                  .then(checkingAccount => {
                    accountId2newId[accountData.account_id] = checkingAccount.aggregateId()
                    accountId2newEntity[accountData.account_id] = checkingAccount
                    return Promise
                      .map(user2accounts, user2account => backend.emitter.emit(new CreateCheckingAccountUserCommand(checkingAccount, userId2newEntity[user2account.user_id])))
                  }))
            }
          )
      })
      .then(() => {
        // Import spendings
        return Promise
          .map(importData.spendings, spendingData => backend.emitter.emit(new CreateSpendingCommand(
            accountId2newEntity[spendingData.account_id],
            _filter(importData.spendinggroups, spendinggroup => spendinggroup.spendinggroup_id === spendingData.spendinggroup_id)[0].name,
            spendingData.description,
              Math.round(parseFloat(spendingData.value) * 100) * (spendingData.type === '1' ? -1 : 1),
              spendingData.booked === '1',
            new Date(`${spendingData.year}-${_padStart(spendingData.month, 2, '0')}-${_padStart(spendingData.day, 2, '0')}T12:00:00+02:00`),
            false,
            userId2newEntity[spendingData.user_id]
            ))
          )
      })
  }
}
