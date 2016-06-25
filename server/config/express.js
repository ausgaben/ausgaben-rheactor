'use strict'

const rheactorExpressConfig = require('rheactor-server/config/express')
const AusgabenModelTransformer = require('../api/transformer')
const JSONLD = require('../config/jsonld')

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param repositories
 * @param {Search} search
 * @param {BackendEmitter} emitter
 */
module.exports = (app, config, repositories, search, emitter) => {
  let jsonld = JSONLD(config.get('api_host'))
  let modelTransformer = new AusgabenModelTransformer()
  let transformer = (jsonld, model, extra) => {
    return modelTransformer.transform(jsonld, model, extra)
  }
  let e = rheactorExpressConfig(app, config, repositories, emitter, transformer, jsonld)

  // Add sugar headers
  let version = config.get('version')
  let deployVersion = config.get('deployVersion')
  let environment = config.get('environment')
  app.use((req, res, next) => {
    res.header('X-Ausgaben-version', version)
    res.header('X-Ausgaben-deployVersion', deployVersion)
    res.header('X-Ausgaben-environment', environment)
    res.header('X-Made-By', 'Markus Tacker | https://cto.hiv/')
    res.header('X-GitHub', 'https://github.com/ausgaben/ausgaben-rheactor')
    next()
  })
}
