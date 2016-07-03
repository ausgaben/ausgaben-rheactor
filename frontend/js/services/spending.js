'use strict'

const _create = require('lodash/create')
const GenericAPIService = require('rheactor-web-app/js/services/generic')
const Spending = require('../model/spending')
const jsonld = require('rheactor-web-app/js/util/jsonld')

/**
 * @param $http
 * @param {APIService} apiService
 * @constructor
 */
function SpendingService ($http, apiService) {
  GenericAPIService.call(this, $http, apiService, Spending.$context)
}

SpendingService.prototype = _create(GenericAPIService.prototype, {
  'constructor': SpendingService
})

/**
 * @param {CheckingAccount} checkingAccount
 * @param {JsonWebToken} token
 * @return {Promise.<List>}
 */
SpendingService.prototype.findByCheckingAccount = function (checkingAccount, token) {
  return GenericAPIService.prototype.list.call(this, jsonld.getListLink(Spending.$context, checkingAccount), {}, token)
}

/**
 * @param {CheckingAccount} checkingAccount
 * @param {Spending} spending
 * @param {JsonWebToken} token
 * @return {Promise.<List>}
 */
SpendingService.prototype.create = function (checkingAccount, spending, token) {
  let self = this
  return self.apiService
    .index()
    .then((index) => {
      return GenericAPIService.prototype.create.call(
        self,
        jsonld.getRelLink('create-spending', checkingAccount),
        spending,
        token
      )
    })
}

module.exports = SpendingService
