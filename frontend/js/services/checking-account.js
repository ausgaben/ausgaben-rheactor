import _create from 'lodash/create'
import {GenericAPIService, JSONLD} from 'rheactor-web-app'
import {CheckingAccount} from '../model/checking-account'

/**
 * @param $http
 * @param {APIService} apiService
 * @constructor
 */
class CheckingAccountService {
  constructor ($http, apiService) {
    GenericAPIService.call(this, $http, apiService, CheckingAccount.$context)
  }

  /**
   * @param {User} user
   * @param {Object} filter
   * @param {JsonWebToken} token
   * @return {Promise.<List>}
   */
  listUserCheckingAccounts (user, filter, token) {
    return GenericAPIService.prototype.list.call(this, JSONLD.getListLink(CheckingAccount.$context, user), filter, token)
  }

  /**
   * @param {CheckingAccount} checkingAccount
   * @param {JsonWebToken} token
   * @return {Promise.<List>}
   */
  create (checkingAccount, token) {
    let self = this
    return self.apiService
      .index()
      .then((index) => {
        return GenericAPIService.prototype.create.call(
          self,
          JSONLD.getRelLink('create-checking-account', index),
          checkingAccount,
          token
        )
      })
  }

  /**
   * @param {Spending} checkingAccount
   * @param {String} property
   * @param {object} value
   * @param {JsonWebToken} token
   * @return {Promise.<List>}
   */
  updateProperty (checkingAccount, property, value, token) {
    let self = this
    return GenericAPIService.prototype.update
      .call(
        self,
        JSONLD.getRelLink(`update-${property}`, checkingAccount),
        {value},
        checkingAccount.$version,
        token
      )
      .then((response) => {
        let lastModified = new Date(response.headers('Last-Modified')).getTime()
        let version = +response.headers('etag')
        checkingAccount[property] = value
        checkingAccount.updated(lastModified, version)
      })
  }
}

CheckingAccountService.prototype = _create(GenericAPIService.prototype, {
  'constructor': CheckingAccountService
})

export default CheckingAccountService
