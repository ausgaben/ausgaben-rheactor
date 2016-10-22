'use strict'

const EmittedEventsHandlerRegistry = require('rheactor-server/services/emitted-events-handler-registry')
const glob = require('glob')
const path = require('path')
const _last = require('lodash/last')
const _map = require('lodash/map')
const _camelCase = require('lodash/camelCase')

/**
 * @param {Array.<AggregateRepository>} repos
 * @param {BackendEmitter} emitter
 * @param {nconf} config
 * @param {object} webConfig
 * @param {TemplateMailerClient} templateMailerClient
 */
module.exports = (repos, emitter, config, webConfig, templateMailerClient) => {
  let c = new EmittedEventsHandlerRegistry(emitter)

  // Register repository command handler
  let matches = glob.sync(path.join(__dirname, '/../command-handler/repository/**/*.js'))
  _map(matches, (match) => {
    let handler = require(match)
    // Bind the repository based on the subfolder name
    let repoName = _camelCase(_last(path.dirname(match).split(path.sep)))
    c.addHandler(handler.command, handler.handler.bind(null, emitter, repos[repoName]))
  })
}
