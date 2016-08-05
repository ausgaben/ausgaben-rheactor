'use strict'

const _map = require('lodash/map')
const _memoize = require('lodash/memoize')
const httpUtil = require('rheactor-web-app/js/util/http')
const HttpProblem = require('rheactor-web-app/js/model/http-problem')
const logger = require('rheactor-web-app/js/util/logger')
const ApplicationError = require('rheactor-value-objects/errors/application')
const Promise = require('bluebird')

const Token = require('rheactor-web-app/js/model/jsonwebtoken')
const Status = require('rheactor-web-app/js/model/status')
const List = require('rheactor-web-app/js/model/list')
const User = require('rheactor-web-app/js/model/user')
const CheckingAccount = require('../model/checking-account')
const Spending = require('../model/spending')
const Periodical = require('../model/periodical')
const Report = require('../model/report')

/**
 * @param {String} apiIndex
 * @param {String} mimeType
 * @param $http
 * @returns {APIService}
 */
module.exports = (apiIndex, mimeType, $http) => {
  function APIService () {
    this.mimeType = mimeType
  }

  /**
   * @returns {Promise.<Object>}
   */
  APIService.prototype.index = _memoize(function () {
    let self = this
    return new Promise(function (resolve, reject) {
      $http.get(apiIndex + '?t=' + Date.now(), httpUtil.accept(self.mimeType))
        .then(function (response) {
          if (response.data.$context !== 'https://github.com/RHeactor/nucleus/wiki/JsonLD#Index') {
            logger.apiWarning('Unexpected $context', response.data.$context, 'expected https://github.com/RHeactor/nucleus/wiki/JsonLD#Index')
            reject(new ApplicationError('APIService.index(): Unexpected $context'))
          }
          resolve(response.data)
        })
        .catch(function (httpError) {
          reject(HttpProblem.fromHttpError(httpError, 'APIService.index() failed!'))
        })
    })
  })

  /**
   * @param {Object} data
   * @returns {Model}
   */
  APIService.prototype.createModelInstance = function (data) {
    let self = this
    switch (data.$context) {
      case Token.$context:
        return new Token(data.token, data.$links)
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
      case List.$context:
        return new List(data.context, _map(data.items, self.createModelInstance.bind(self)), data.total, data.offset, data.itemsPerPage, data.$links)
      default:
        logger.apiWarning('Unknown context', data.$context, data)
    }
  }

  return new APIService()
}
