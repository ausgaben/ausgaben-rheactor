'use strict'

const _create = require('lodash/create')
const GenericAPIService = require('rheactor-web-app/js/services/generic')
const CheckingAccount = require('../model/checking-account')
const jsonld = require('rheactor-web-app/js/util/jsonld')

/**
 * @param $http
 * @param {APIService} apiService
 * @constructor
 */
function CheckingAccountService ($http, apiService) {
  GenericAPIService.call(this, $http, apiService, CheckingAccount.$context)
}

CheckingAccountService.prototype = _create(GenericAPIService.prototype, {
  'constructor': CheckingAccountService
})

/**
 * @param {User} user
 * @param {Object} filter
 * @param {JsonWebToken} token
 * @return {Promise.<List>}
 */
CheckingAccountService.prototype.listUserCheckingAccounts = function (user, filter, token) {
  return GenericAPIService.prototype.list.call(this, jsonld.getListLink(CheckingAccount.$context, user), filter, token)
}

/**
 * @param {CheckingAccount} checkingAccount
 * @param {JsonWebToken} token
 * @return {Promise.<List>}
 */
CheckingAccountService.prototype.create = function (checkingAccount, token) {
  let self = this
  return self.apiService
    .index()
    .then((index) => {
      return GenericAPIService.prototype.create.call(
        self,
        jsonld.getRelLink('create-checking-account', index),
        checkingAccount,
        token
      )
    })
}

module.exports = CheckingAccountService
