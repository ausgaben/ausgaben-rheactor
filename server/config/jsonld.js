'use strict'

const _trimEnd = require('lodash/trimEnd')
const JSONLD = require('rheactor-server/api/jsonld')
const User = require('rheactor-web-app/js/model/user')
const Token = require('rheactor-web-app/js/model/jsonwebtoken')
const Status = require('rheactor-web-app/js/model/status')
const URIValue = require('rheactor-value-objects/uri')
const CheckingAccount = require('../../frontend/js/model/checking-account')

/**
 * @param apiHost
 * @return {JSONLD}
 */
module.exports = function (apiHost) {
  let apiBase = _trimEnd(apiHost, '/') + '/api'
  let jsonld = new JSONLD()

  jsonld.mapType(User.$context, new URIValue(apiBase + '/user/:id'))
  jsonld.mapType(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id'))

  jsonld.addLink('index', new URIValue(apiBase + '/status'), Status.$context, 'status')
  jsonld.addLink('index', new URIValue(apiBase + '/login'), Token.$context, 'login')
  jsonld.addLink('index', new URIValue(apiBase + '/registration'), User.$context, 'register')
  jsonld.addLink('index', new URIValue(apiBase + '/password-change'), User.$context, 'password-change')
  jsonld.addLink('index', new URIValue(apiBase + '/password-change/confirm'), User.$context, 'password-change-confirm')
  jsonld.addLink('index', new URIValue(apiBase + '/activate-account'), User.$context, 'activate-account')
  jsonld.addLink('index', new URIValue(apiBase + '/avatar'), User.$context, 'avatar-upload')

  jsonld.addLink(Token.$context, new URIValue(apiBase + '/token/verify'), Token.$context, 'token-verify')
  jsonld.addLink(Token.$context, new URIValue(apiBase + '/token/renew'), Token.$context, 'token-renew')

  jsonld.addLink('index', new URIValue(apiBase + '/checking-account'), CheckingAccount.$context, 'create-checking-account')
  jsonld.addLink(User.$context, new URIValue(apiBase + '/search/checking-account'), CheckingAccount.$context, 'my-checking-accounts', true)

  return jsonld
}
