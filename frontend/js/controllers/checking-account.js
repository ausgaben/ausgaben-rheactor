'use strict'

module.exports = (app) => {
  require('./checking-account/index')(app)
  app
    .config(['$stateProvider', ($stateProvider) => {
      $stateProvider
        .state('checking-account', {
          url: '/account/:identifier',
          title: 'Checking account',
          templateUrl: '/view/checking-account.html',
          controllerAs: 'vm',
          controller: 'CheckingAccountController'
        })
    }])
}
