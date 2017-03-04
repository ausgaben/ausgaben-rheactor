import _create from 'lodash/create'
import {GenericAPIService, JSONLD} from 'rheactor-web-app'
import {Spending} from '../model/spending'

/**
 * @param $http
 * @param {APIService} apiService
 * @constructor
 */
class SpendingService {
  constructor ($http, apiService) {
    GenericAPIService.call(this, $http, apiService, Spending.$context)
  }

  /**
   * @param {CheckingAccount} checkingAccount
   * @param {object} query
   * @param {JsonWebToken} token
   * @return {Promise.<List>}
   */
  findByCheckingAccount (checkingAccount, query, token) {
    return GenericAPIService.prototype.list.call(this, JSONLD.getListLink(Spending.$context, checkingAccount), query, token)
  }

  /**
   * @param {CheckingAccount} checkingAccount
   * @param {Spending} spending
   * @param {JsonWebToken} token
   * @return {Promise.<List>}
   */
  create (checkingAccount, spending, token) {
    let self = this
    return self.apiService
      .index()
      .then((index) => {
        return GenericAPIService.prototype.create.call(
          self,
          JSONLD.getRelLink('create-spending', checkingAccount),
          {
            category: spending.category,
            title: spending.title,
            amount: spending.amount,
            booked: spending.booked,
            bookedAt: spending.bookedAt,
            saving: spending.saving,
            paidWith: spending.paidWith
          },
          token
        )
      })
  }

  /**
   * @param {Spending} spending
   * @param {JsonWebToken} token
   * @return {Promise.<List>}
   */
  update (spending, token) {
    let self = this
    return GenericAPIService.prototype.update.call(
      self,
      spending.$id,
      {
        category: spending.category,
        title: spending.title,
        amount: spending.amount,
        booked: spending.booked,
        bookedAt: spending.bookedAt,
        saving: spending.saving,
        paidWith: spending.paidWith
      },
      spending.$version,
      token
    )
      .then((response) => {
        let lastModified = new Date(response.headers('Last-Modified')).getTime()
        let version = +response.headers('etag')
        spending.updated(lastModified, version)
      })
  }

  /**
   * @param {Spending} spending
   * @param {JsonWebToken} token
   * @return {Promise.<List>}
   */
  delete (spending, token) {
    let self = this
    return GenericAPIService.prototype.delete.call(
      self,
      spending.$id,
      spending.$version,
      token
    )
      .then((response) => {
        let lastModified = new Date(response.headers('Last-Modified')).getTime()
        let version = +response.headers('etag')
        spending.deleted(lastModified, version)
      })
  }
}

SpendingService.prototype = _create(GenericAPIService.prototype, {
  'constructor': SpendingService
})

export default SpendingService
