'use strict'

const APIService = require('./api')
const CheckingAccountService = require('./checking-account')
const SpendingService = require('./spending')
const ReportService = require('./report')

require('angular')
  .module('AusgabenServiceModule', [])
  .factory('APIService', ['FrontendConfig', '$http', (config, $http) => {
    return new APIService(config.apiIndex, config.mimeType, $http)
  }])
  .factory('CheckingAccountService', ['$http', 'APIService', ($http, APIService) => {
    return new CheckingAccountService($http, APIService)
  }])
  .factory('SpendingService', ['$http', 'APIService', ($http, APIService) => {
    return new SpendingService($http, APIService)
  }])
  .factory('ReportService', ['$http', 'APIService', ($http, APIService) => {
    return new ReportService($http, APIService)
  }])
