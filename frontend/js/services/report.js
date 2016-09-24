'use strict'

const _create = require('lodash/create')
const GenericAPIService = require('rheactor-web-app/js/services/generic')
const Report = require('../model/report')
const jsonld = require('rheactor-web-app/js/util/jsonld')

/**
 * @param $http
 * @param {APIService} apiService
 * @constructor
 */
function ReportService ($http, apiService) {
  GenericAPIService.call(this, $http, apiService, Report.$context)
}

ReportService.prototype = _create(GenericAPIService.prototype, {
  'constructor': ReportService
})

/**
 * @param {CheckingAccount} checkingAccount
 * @param {Object} filter
 * @param {JsonWebToken} token
 * @return {Promise.<List>}
 */
ReportService.prototype.report = function (checkingAccount, filter, token) {
  return GenericAPIService.prototype.query.call(this, jsonld.getRelLink('report', checkingAccount), filter, token)
}

module.exports = ReportService
