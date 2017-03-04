/* global: window, document */

import logger from 'rheactor-web-app/js/util/logger'

logger.appInfo('Init …')
require('bluebird').longStackTraces()

require('angular-ui-router')
require('angular-validation-match')
require('angular-sanitize')
require('ng-file-upload')
require('moment')
require('angular-moment')
const app = require('angular')
  .module('AusgabenApp', [
    'ui.router',
    'validation.match',
    require('angular-bluebird-promises'),
    'ngSanitize',
    'ngFileUpload',
    'angularMoment',
    'FrontendConfigModule',
    'RHeactorDirectiveModule',
    'RHeactorFilterModule',
    'AusgabenServiceModule',
    'AusgabenFilterModule',
    'RHeactorServiceModule',
    'RHeactorDecoratorModule',
    'RHeactorModelModule'
  ])

app
  .config(['$interpolateProvider', $interpolateProvider => {
    $interpolateProvider.startSymbol('%%')
    $interpolateProvider.endSymbol('%%')
  }])
  .config(['$locationProvider', $locationProvider => {
    $locationProvider.hashPrefix('!')
  }])
  .config(['$urlRouterProvider', $urlRouterProvider => {
    $urlRouterProvider.otherwise($injector => {
      logger.appInfo('Opening default state: dashboard')
      let $state = $injector.get('$state')
      $state.go('dashboard')
    })
  }])
  .config(['$compileProvider', $compileProvider => {
    // https://code.angularjs.org/1.5.5/docs/guide/production
    $compileProvider.debugInfoEnabled(false)
  }])
  .run(['StatusService', '$rootScope',
    /**
     * @param {StatusService} StatusService
     * @param {object} $rootScope
     */
    (StatusService, $rootScope) => {
      StatusService.status()
        .then((status) => {
          $rootScope.status = status
        })
    }])

require('./services/index')
require('./filters/index')
require('./controllers/index')(app)
require('rheactor-web-app/js/directives/index')
require('rheactor-web-app/js/services/index')
require('rheactor-web-app/js/model/index')
require('rheactor-web-app/js/filters/index')
require('rheactor-web-app/js/decorators/index')
require('bootstrap')
require('rheactor-web-app/js/util/handle-encoded-app-urls')
