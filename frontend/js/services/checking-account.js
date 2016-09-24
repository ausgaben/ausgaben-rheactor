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

/**
 * @param {Spending} checkingAccount
 * @param {String} property
 * @param {object} value
 * @param {JsonWebToken} token
 * @return {Promise.<List>}
 */
CheckingAccountService.prototype.updateProperty = function (checkingAccount, property, value, token) {
  let self = this
  return GenericAPIService.prototype.update
    .call(
      self,
      jsonld.getRelLink('update-' + property, checkingAccount),
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

module.exports = CheckingAccountService
