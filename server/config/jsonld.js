import _trimEnd from 'lodash/trimEnd'
import {JSONLD} from 'rheactor-server'
import {User, JsonWebToken, Status, Link} from 'rheactor-models'
import {URIValue} from 'rheactor-value-objects'
import {CheckingAccount} from '../../build/js-es5/model/checking-account'
import {Spending} from '../../build/js-es5/model/spending'
import {Category} from '../../build/js-es5/model/category'
import {Title} from '../../build/js-es5/model/title'
import {Periodical} from '../../build/js-es5/model/periodical'
import {Report} from '../../build/js-es5/model/report'

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

  relations.addLink(JsonWebToken.$context, new URIValue(`${apiBase}/token/verify`), JsonWebToken.$context, 'token-verify')
  relations.addLink(JsonWebToken.$context, new URIValue(`${apiBase}/token/renew`), JsonWebToken.$context, 'token-renew')

  relations.addIndexLink(new Link(new URIValue(`${apiBase}/checking-account`), CheckingAccount.$context, false, 'create-checking-account'))
  relations.addLink(User.$context, new URIValue(`${apiBase}/search/checking-account`), CheckingAccount.$context, 'my-checking-accounts', true)
  relations.addLink(User.$context, new URIValue(`${apiBase}/user/:id/email-change`), User.$context, 'change-email')
  relations.addLink(User.$context, new URIValue(`${apiBase}/user/:id/email-change/confirm`), User.$context, 'change-email-confirm')
  relations.addLink(User.$context, new URIValue(`${apiBase}/user/:id/email`), User.$context, 'update-email')
  relations.addLink(User.$context, new URIValue(`${apiBase}/user/:id/active`), User.$context, 'update-active')
  relations.addLink(User.$context, new URIValue(`${apiBase}/user/:id/firstname`), User.$context, 'update-firstname')
  relations.addLink(User.$context, new URIValue(`${apiBase}/user/:id/lastname`), User.$context, 'update-lastname')

  relations.addLink(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id/search/spending`), Spending.$context, 'spendings', true)
  relations.addLink(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id/search/category`), Category.$context, 'categories', true)
  relations.addLink(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id/search/title`), Title.$context, 'titles', true)
  relations.addLink(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id/spending`), Spending.$context, 'create-spending')
  relations.addLink(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id/search/periodical`), Periodical.$context, 'periodicals', true)
  relations.addLink(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id/periodical`), Periodical.$context, 'create-periodical')
  relations.addLink(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id/monthly`), CheckingAccount.$context, 'update-monthly')
  relations.addLink(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id/savings`), CheckingAccount.$context, 'update-savings')
  relations.addLink(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id/report`), Report.$context, 'report')
  relations.addLink(CheckingAccount.$context, new URIValue(`${apiBase}/checking-account/:id/stream`), null, 'stream')

  return relations
}
