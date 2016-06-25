'use strict'

const _trimEnd = require('lodash/trimEnd')
const Jsonld = require('rheactor-server/api/jsonld')
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
  let relations = new Jsonld()

  relations.mapType(User.$context, new URIValue(apiBase + '/user/:id'))
  relations.mapType(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id'))

  relations.addLink('index', new URIValue(apiBase + '/status'), Status.$context, 'status')
  relations.addLink('index', new URIValue(apiBase + '/login'), Token.$context, 'login')
  relations.addLink('index', new URIValue(apiBase + '/registration'), User.$context, 'register')
  relations.addLink('index', new URIValue(apiBase + '/password-change'), User.$context, 'password-change')
  relations.addLink('index', new URIValue(apiBase + '/password-change/confirm'), User.$context, 'password-change-confirm')
  relations.addLink('index', new URIValue(apiBase + '/activate-account'), User.$context, 'activate-account')
  relations.addLink('index', new URIValue(apiBase + '/avatar'), User.$context, 'avatar-upload')

  relations.addLink(Token.$context, new URIValue(apiBase + '/token/verify'), Token.$context, 'token-verify')
  relations.addLink(Token.$context, new URIValue(apiBase + '/token/renew'), Token.$context, 'token-renew')

  relations.addLink('index', new URIValue(apiBase + '/checking-account'), CheckingAccount.$context, 'create-checking-account')
  relations.addLink(User.$context, new URIValue(apiBase + '/search/checking-account'), CheckingAccount.$context, 'my-checking-accounts', true)

  return relations
}
