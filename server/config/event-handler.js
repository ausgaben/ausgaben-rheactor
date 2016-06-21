'use strict'

let EmittedEventsHandlerRegistry = require('rheactor-server/services/emitted-events-handler-registry')

/**
 * @param {Array.<AggregateRepository>} repos
 * @param {BackendEmitter} emitter
 * @param {TemplateMailerClient} templateMailerClient
 * @param {nconf} config
 */
module.exports = (repos, emitter, config, templateMailerClient) => {
  let c = new EmittedEventsHandlerRegistry(emitter)
}
