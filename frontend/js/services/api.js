import _map from 'lodash/map'
import _memoize from 'lodash/memoize'
import {httpUtil, appLogger} from '@rheactorjs/web-app'
import {HttpProblem, JsonWebToken, Status, List, User} from '@rheactorjs/models'
import {ApplicationError} from '@rheactorjs/errors'
import Promise from 'bluebird'
import {CheckingAccount} from '../model/checking-account'
import {Spending} from '../model/spending'
import {Periodical} from '../model/periodical'
import {Report} from '../model/report'
import {Title} from '../model/title'
import {Category} from '../model/category'

const logger = appLogger()

/**
 * @param {String} apiIndex
 * @param {String} mimeType
 * @param $http
 * @returns {APIService}
 */
export default (apiIndex, mimeType, $http) => {
  class APIService {
    constructor () {
      this.mimeType = mimeType
    }

    /**
     * @param {Object} data
     * @returns {Model}
     */
    createModelInstance (data) {
      let self = this
      switch (data.$context.toString()) {
        case JsonWebToken.$context.toString():
          return new JsonWebToken(data.token, data.$links)
        case User.$context.toString():
          return User.fromJSON(data)
        case Status.$context.toString():
          return Status.fromJSON(data)
        case CheckingAccount.$context.toString():
          return CheckingAccount.fromJSON(data)
        case Spending.$context.toString():
          return Spending.fromJSON(data)
        case Periodical.$context.toString():
          return Periodical.fromJSON(data)
        case Report.$context.toString():
          return Report.fromJSON(data)
        case Title.$context.toString():
          return Title.fromJSON(data)
        case Category.$context.toString():
          return Category.fromJSON(data)
        case List.$context.toString():
          return new List(data.context, _map(data.items, self.createModelInstance.bind(self)), data.total, data.offset, data.itemsPerPage, data.$links)
        default:
          logger.apiWarning('Unknown context', data.$context, data)
      }
    }
  }

  /**
   * @returns {Promise.<Object>}
   */
  APIService.prototype.index = _memoize(function () {
    let self = this
    return new Promise((resolve, reject) => {
      $http.get(`${apiIndex}?t=${Date.now()}`, httpUtil.accept(self.mimeType))
        .then(response => {
          if (response.data.$context !== 'https://github.com/RHeactorJS/models#Index') {
            logger.apiWarning('Unexpected $context', response.data.$context, 'expected https://github.com/RHeactorJS/models#Index')
            reject(new ApplicationError('APIService.index(): Unexpected $context'))
          }
          resolve(response.data)
        })
        .catch(httpError => {
          reject(HttpProblem.fromHttpError(httpError, 'APIService.index() failed!'))
        })
    })
  })

  return new APIService()
}
