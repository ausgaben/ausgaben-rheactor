'use strict'

const APIService = require('./api')

require('angular')
  .module('ausgabenServiceModule', [])
  .factory('APIService', ['FrontendConfig', '$http', (config, $http) => {
    return new APIService(config.apiIndex, config.mimeType, $http)
  }])
