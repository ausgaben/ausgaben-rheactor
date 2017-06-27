import {EmittedEventsHandlerRegistry} from '@rheactorjs/server'

import createCheckingAccountCommandHandler from '../command-handler/repository/checking-account/create'
import updateCheckingAccountPropertyCommandHandler from '../command-handler/repository/checking-account/update-property'
import createCheckingAccountUserCommandHandler from '../command-handler/repository/checking-account-user/create'
import createPeriodicalCommandHandler from '../command-handler/repository/periodical/create'
import createSpendingCommandHandler from '../command-handler/repository/spending/create'
import updateSpendingCommandHandler from '../command-handler/repository/spending/update'
import deleteSpendingCommandHandler from '../command-handler/repository/spending/delete'

/**
 * @param {Array.<AggregateRepository>} repos
 * @param {BackendEmitter} emitter
 * @param {nconf} config
 * @param {object} webConfig
 * @param {TemplateMailerClient} templateMailerClient
 */
export default (repos, emitter, config, webConfig, templateMailerClient) => {
  let c = new EmittedEventsHandlerRegistry(emitter)

  const commandHandler = [
    {
      repository: repos.checkingAccount,
      handler: [
        createCheckingAccountCommandHandler,
        updateCheckingAccountPropertyCommandHandler
      ]
    },
    {
      repository: repos.checkingAccountUser,
      handler: [
        createCheckingAccountUserCommandHandler
      ]
    },
    {
      repository: repos.periodical,
      handler: [
        createPeriodicalCommandHandler
      ]
    },
    {
      repository: repos.spending,
      handler: [
        createSpendingCommandHandler,
        updateSpendingCommandHandler,
        deleteSpendingCommandHandler
      ]
    }
  ]

  // Register repository command handler
  commandHandler.map(repoHandler => {
    repoHandler.handler.map(handler => {
      c.addHandler(handler.command, handler.handler.bind(null, emitter, repoHandler.repository))
    })
  })
}
