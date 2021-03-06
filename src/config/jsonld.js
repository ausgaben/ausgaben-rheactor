import _trimEnd from 'lodash/trimEnd'
import {JSONLD} from '@rheactorjs/server'
import {JsonWebToken, Link, Status, User} from '@rheactorjs/models'
import {URIValue} from '@rheactorjs/value-objects'
import {Category, CheckingAccount, Periodical, Report, Spending, Title} from '@ausgaben/models'
import {$context as streamContext} from '../api/stream'

/**
 * @param apiHost
 * @return {JSONLD}
 */
export default apiHost => {
  let apiBase = `${_trimEnd(apiHost, '/')}/api`
  let relations = new JSONLD()

  relations.mapType(User.$context, new URIValue(`${apiBase}/user/:id`))
  relations.mapType(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id`))
  relations.mapType(Spending.$context, new URIValue(`${apiBase}/spending/:id`))
  relations.mapType(Periodical.$context, new URIValue(`${apiBase}/periodical/:id`))

  relations.addIndexLink(new Link(new URIValue(`${apiBase}/status`), Status.$context, false, 'status'))
  relations.addIndexLink(new Link(new URIValue(`${apiBase}/login`), JsonWebToken.$context, false, 'login'))
  relations.addIndexLink(new Link(new URIValue(`${apiBase}/registration`), User.$context, false, 'register'))
  relations.addIndexLink(new Link(new URIValue(`${apiBase}/password-change`), User.$context, false, 'password-change'))
  relations.addIndexLink(new Link(new URIValue(`${apiBase}/password-change/confirm`), User.$context, false, 'password-change-confirm'))
  relations.addIndexLink(new Link(new URIValue(`${apiBase}/activate-account`), User.$context, false, 'activate-account'))
  relations.addIndexLink(new Link(new URIValue(`${apiBase}/avatar`), User.$context, false, 'avatar-upload'))

  relations.addLink(JsonWebToken.$context, new Link(new URIValue(`${apiBase}/token/verify`), JsonWebToken.$context, false, 'token-verify'))
  relations.addLink(JsonWebToken.$context, new Link(new URIValue(`${apiBase}/token/renew`), JsonWebToken.$context, false, 'token-renew'))

  relations.addIndexLink(new Link(new URIValue(`${apiBase}/checking-account`), CheckingAccount.$context, false, 'create-checking-account'))
  relations.addLink(User.$context, new Link(new URIValue(`${apiBase}/search/checking-account`), CheckingAccount.$context, true, 'my-checking-accounts'))
  relations.addLink(User.$context, new Link(new URIValue(`${apiBase}/user/:id/email-change`), User.$context, false, 'change-email'))
  relations.addLink(User.$context, new Link(new URIValue(`${apiBase}/user/:id/email-change/confirm`), User.$context, false, 'change-email-confirm'))
  relations.addLink(User.$context, new Link(new URIValue(`${apiBase}/user/:id/email`), User.$context, false, 'update-email'))
  relations.addLink(User.$context, new Link(new URIValue(`${apiBase}/user/:id/active`), User.$context, false, 'update-active'))
  relations.addLink(User.$context, new Link(new URIValue(`${apiBase}/user/:id/firstname`), User.$context, false, 'update-firstname'))
  relations.addLink(User.$context, new Link(new URIValue(`${apiBase}/user/:id/lastname`), User.$context, false, 'update-lastname'))

  relations.addLink(CheckingAccount.$context, new Link(new URIValue(`${apiBase}/checking-account/:id/search/spending`), Spending.$context, true, 'spendings'))
  relations.addLink(CheckingAccount.$context, new Link(new URIValue(`${apiBase}/checking-account/:id/search/category`), Category.$context, true, 'categories'))
  relations.addLink(CheckingAccount.$context, new Link(new URIValue(`${apiBase}/checking-account/:id/search/title`), Title.$context, true, 'titles'))
  relations.addLink(CheckingAccount.$context, new Link(new URIValue(`${apiBase}/checking-account/:id/spending`), Spending.$context, false, 'create-spending'))
  relations.addLink(CheckingAccount.$context, new Link(new URIValue(`${apiBase}/checking-account/:id/search/periodical`), Periodical.$context, true, 'periodicals'))
  relations.addLink(CheckingAccount.$context, new Link(new URIValue(`${apiBase}/checking-account/:id/periodical`), Periodical.$context, false, 'create-periodical'))
  relations.addLink(CheckingAccount.$context, new Link(new URIValue(`${apiBase}/checking-account/:id/monthly`), CheckingAccount.$context, false, 'update-monthly'))
  relations.addLink(CheckingAccount.$context, new Link(new URIValue(`${apiBase}/checking-account/:id/savings`), CheckingAccount.$context, false, 'update-savings'))
  relations.addLink(CheckingAccount.$context, new Link(new URIValue(`${apiBase}/checking-account/:id/report`), Report.$context, false, 'report'))
  relations.addLink(CheckingAccount.$context, new Link(new URIValue(`${apiBase}/checking-account/:id/stream`), streamContext, false, 'stream'))

  return relations
}
