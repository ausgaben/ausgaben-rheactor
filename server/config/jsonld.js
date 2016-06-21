'use strict'

const _trimEnd = require('lodash/trimEnd')
const JSONLD = require('rheactor-server/api/jsonld')

/**
 * @param apiHost
 * @return {JSONLD}
 */
module.exports = function (apiHost) {
  let apiBase = _trimEnd(apiHost, '/') + '/api'
  let jsonld = new JSONLD()

  return jsonld
}
