'use strict'

module.exports = (app) => {
  require('./checking-account/index')(app)
  app
    .config(['$stateProvider', ($stateProvider) => {
      $stateProvider
        .state('checking-account', {
          url: '/checking-account/:identifier',
          title: 'Checking account',
          templateUrl: '/view/checking-account.html',
          controllerAs: 'vm',
          controller: 'CheckingAccountController'
        })
        .state('checking-account.spendings', {
          url: '/spendings',
          templateUrl: '/view/checking-account-spendings.html',
          controllerAs: 'vm',
          controller: 'CheckingAccountSpendingsController'
        })
        .state('checking-account.add-spending', {
          url: '/add-spending',
          templateUrl: '/view/checking-account-spending.html',
          controllerAs: 'vm',
          controller: 'CheckingAccountSpendingController'
        })
        .state('checking-account.edit-spending', {
          url: '/spending/:spending_id',
          templateUrl: '/view/checking-account-spending.html',
          controllerAs: 'vm',
          controller: 'CheckingAccountSpendingController'
        })
    }])
}
