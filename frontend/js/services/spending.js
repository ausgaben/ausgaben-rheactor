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
 * @param {object} query
 * @param {JsonWebToken} token
 * @return {Promise.<List>}
 */
SpendingService.prototype.findByCheckingAccount = function (checkingAccount, query, token) {
  return GenericAPIService.prototype.list.call(this, jsonld.getListLink(Spending.$context, checkingAccount), query, token)
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
SpendingService.prototype.update = function (spending, token) {
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
SpendingService.prototype.delete = function (spending, token) {
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

module.exports = SpendingService
