import APIService from './api'
import CheckingAccountService from './checking-account'
import SpendingService from './spending'
import ReportService from './report'
import {Category} from '../model/category'
import {Title} from '../model/title'
import {GenericApiService} from 'rheactor-web-app'

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
  .factory('CategoryService', ['$http', 'APIService', ($http, APIService) => {
    return new GenericApiService($http, APIService, Category.$context)
  }])
  .factory('TitleService', ['$http', 'APIService', ($http, APIService) => {
    return new GenericApiService($http, APIService, Title.$context)
  }])
