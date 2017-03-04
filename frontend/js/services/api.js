import _map from 'lodash/map'
import _memoize from 'lodash/memoize'
import {httpUtil, appLogger} from 'rheactor-web-app'
import {HttpProblem, JsonWebToken, Status, List, User} from 'rheactor-models'
import {ApplicationError} from '@resourcefulhumans/rheactor-errors'
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
      switch (data.$context) {
        case JsonWebToken.$context:
          return new JsonWebToken(data.token, data.$links)
        case User.$context:
          return new User(data)
        case Status.$context:
          return new Status(data)
        case CheckingAccount.$context:
          return new CheckingAccount(data)
        case Spending.$context:
          return new Spending(data)
        case Periodical.$context:
          return new Periodical(data)
        case Report.$context:
          return new Report(data)
        case Title.$context:
          return new Title(data.title, data.category)
        case Category.$context:
          return new Category(data.title)
        case List.$context:
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
          if (response.data.$context !== 'https://github.com/RHeactor/nucleus/wiki/JsonLD#Index') {
            logger.apiWarning('Unexpected $context', response.data.$context, 'expected https://github.com/RHeactor/nucleus/wiki/JsonLD#Index')
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
