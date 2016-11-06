'use strict'

const _trimEnd = require('lodash/trimEnd')
const Jsonld = require('rheactor-server/api/jsonld')
const User = require('rheactor-web-app/js/model/user')
const Token = require('rheactor-web-app/js/model/jsonwebtoken')
const Status = require('rheactor-web-app/js/model/status')
const URIValue = require('rheactor-value-objects/uri')
const CheckingAccount = require('../../frontend/js/model/checking-account')
const Spending = require('../../frontend/js/model/spending')
const Category = require('../../frontend/js/model/category')
const Title = require('../../frontend/js/model/title')
const Periodical = require('../../frontend/js/model/periodical')
const Report = require('../../frontend/js/model/report')

/**
 * @param apiHost
 * @return {JSONLD}
 */
module.exports = function (apiHost) {
  let apiBase = _trimEnd(apiHost, '/') + '/api'
  let relations = new Jsonld()

  relations.mapType(User.$context, new URIValue(apiBase + '/user/:id'))
  relations.mapType(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id'))
  relations.mapType(Spending.$context, new URIValue(apiBase + '/spending/:id'))
  relations.mapType(Periodical.$context, new URIValue(apiBase + '/periodical/:id'))

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
  relations.addLink(User.$context, new URIValue(apiBase + '/user/:id/email-change'), User.$context, 'change-email')
  relations.addLink(User.$context, new URIValue(apiBase + '/user/:id/email-change/confirm'), User.$context, 'change-email-confirm')
  relations.addLink(User.$context, new URIValue(apiBase + '/user/:id/email'), User.$context, 'update-email')
  relations.addLink(User.$context, new URIValue(apiBase + '/user/:id/active'), User.$context, 'update-active')
  relations.addLink(User.$context, new URIValue(apiBase + '/user/:id/firstname'), User.$context, 'update-firstname')
  relations.addLink(User.$context, new URIValue(apiBase + '/user/:id/lastname'), User.$context, 'update-lastname')

  relations.addLink(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id/search/spending'), Spending.$context, 'spendings', true)
  relations.addLink(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id/search/category'), Category.$context, 'categories', true)
  relations.addLink(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id/search/title'), Title.$context, 'titles', true)
  relations.addLink(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id/spending'), Spending.$context, 'create-spending')
  relations.addLink(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id/search/periodical'), Periodical.$context, 'periodicals', true)
  relations.addLink(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id/periodical'), Periodical.$context, 'create-periodical')
  relations.addLink(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id/monthly'), CheckingAccount.$context, 'update-monthly')
  relations.addLink(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id/report'), Report.$context, 'report')
  relations.addLink(CheckingAccount.$context, new URIValue(apiBase + '/checking-account/:id/stream'), null, 'stream')

  return relations
}
