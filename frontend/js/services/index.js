'use strict'

const APIService = require('./api')
const CheckingAccountService = require('./checking-account')

require('angular')
  .module('ausgabenServiceModule', [])
  .factory('APIService', ['FrontendConfig', '$http', (config, $http) => {
    return new APIService(config.apiIndex, config.mimeType, $http)
  }])
  .factory('CheckingAccountService', ['$http', 'APIService', ($http, APIService) => {
    return new CheckingAccountService($http, APIService)
  }])
