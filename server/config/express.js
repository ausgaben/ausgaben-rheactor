import {rheactorExpressConfig} from 'rheactor-server'
import AusgabenModelTransformer from '../api/transformer'
import JSONLD from '../config/jsonld'

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
  let e = rheactorExpressConfig(app, config, webConfig, repositories, emitter, transformer, jsonld)

  // Add sugar headers
  let version = config.get('version')
  let environment = config.get('environment')
  app.use((req, res, next) => {
    res.header('X-Ausgaben-version', version)
    res.header('X-Ausgaben-environment', environment)
    res.header('X-Made-By', 'Markus Tacker | https://coderbyheart.com/')
    res.header('X-GitHub', 'https://github.com/ausgaben/ausgaben-rheactor')
    next()
  })

  require('../api/checking-account')(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.spending, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  require('../api/report')(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.spending, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  require('../api/spending')(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.spending, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  require('../api/category')(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  require('../api/title')(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  require('../api/periodical')(app, config, emitter, repositories.checkingAccount, repositories.checkingAccountUser, repositories.periodical, repositories.user, search, e.tokenAuth, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
  require('../api/stream')(app, emitter, e.verifyToken, repositories.checkingAccount, repositories.checkingAccountUser, repositories.spending, jsonld, e.sendHttpProblem, transformer.bind(null, jsonld))
}
