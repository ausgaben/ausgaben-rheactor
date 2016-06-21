'use strict'

const Promise = require('bluebird')
const _reverse = require('lodash/reverse')

/**
 * The search service knows about the various repositories and how to use their indices to optimize the search
 *
 * It also maintains own indices
 *
 * @param repositories
 * @param redis
 * @param {BackendEmitter} emitter
 * @constructor
 */
function Search (repositories, redis, emitter) {
  Object.defineProperty(this, 'repositories', {value: repositories})
  Object.defineProperty(this, 'redis', {value: redis})
  Object.defineProperty(this, 'emitter', {value: emitter})
}

module.exports = Search
