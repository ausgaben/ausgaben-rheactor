'use strict'

const rheactorExpressConfig = require('rheactor-server/config/express')
const CaRHdModelTransformer = require('../api/transformer')
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
  let modelTransformer = new CaRHdModelTransformer()
  let transformer = (jsonld, model, extra) => {
    return modelTransformer.transform(jsonld, model, extra)
  }
  let e = rheactorExpressConfig(app, config, repositories, emitter, transformer, jsonld)

  // Add sugar headers
  let version = config.get('version')
  let deployVersion = config.get('deployVersion')
  let environment = config.get('environment')
  app.use((req, res, next) => {
    res.header('X-caRHds-version', version)
    res.header('X-caRHds-deployVersion', deployVersion)
    res.header('X-caRHds-environment', environment)
    res.header('X-Made-By', 'Resourceful Humans GmbH with <3 in many places worldwide. http://resourceful-humans.com/')
    res.header('X-GitHub', 'https://github.com/ResourcefulHumans/')
    next()
  })
}
