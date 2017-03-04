import _create from 'lodash/create'
import {GenericAPIService, JSONLD} from 'rheactor-web-app'
import {Report} from '../model/report'

/**
 * @param $http
 * @param {APIService} apiService
 * @constructor
 */
class ReportService {
  constructor ($http, apiService) {
    GenericAPIService.call(this, $http, apiService, Report.$context)
  }

  /**
   * @param {CheckingAccount} checkingAccount
   * @param {Object} filter
   * @param {JsonWebToken} token
   * @return {Promise.<List>}
   */
  report (checkingAccount, filter, token) {
    return GenericAPIService.prototype.query.call(this, JSONLD.getRelLink('report', checkingAccount), filter, token)
  }
}

ReportService.prototype = _create(GenericAPIService.prototype, {
  'constructor': ReportService
})

export default ReportService
