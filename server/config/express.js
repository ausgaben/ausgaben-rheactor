import {rheactorjsExpressConfig} from '@rheactorjs/server'
import AusgabenModelTransformer from '../api/transformer'
import JSONLD from '../config/jsonld'

import checkingAccountRoutes from '../api/checking-account'
import reportRoutes from '../api/report'
import spendingRoutes from '../api/spending'
import categoryRoutes from '../api/category'
import titleRoutes from '../api/title'
import periodicalRoutes from '../api/periodical'
import streamRoutes from '../api/stream'

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param {object} webConfig
 * @param repositories
 * @param {Search} search
 * @param {BackendEmitter} emitter
 */
export default (app, config, webConfig, repositories, search, emitter) => {
  let jsonld = JSONLD(config.get('api_host'))
  let modelTransformer = new AusgabenModelTransformer()
  let transformer = (jsonld, model, extra) => {
    return modelTransformer.transform(jsonld, model, extra)
  }
  let e = rheactorjsExpressConfig(app, config, webConfig, repositories, emitter, transformer, jsonld)

  checkingAccountRoutes(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.spending, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  reportRoutes(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.spending, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  spendingRoutes(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.spending, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  categoryRoutes(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  titleRoutes(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  periodicalRoutes(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.periodical, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  streamRoutes(app, emitter, e.verifyToken, repositories.checkingAccount, repositories.checkingAccountUser, repositories.spending, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
}
