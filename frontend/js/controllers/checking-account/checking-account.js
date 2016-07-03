'use strict'

const Promise = require('bluebird')
const EventSourceConnection = require('rheactor-web-app/js/util/event-source-connection')
const jsonld = require('rheactor-web-app/js/util/jsonld')

module.exports = (app) => {
  app
    .controller('CheckingAccountController', ['$rootScope', '$scope', '$state', '$stateParams', 'CheckingAccountService', 'ClientStorageService',
      /**
       * @param {object} $rootScope
       * @param {object} $scope
       * @param {object} $state
       * @param {object} $stateParams
       * @param {CheckingAccountService} CheckingAccountService
       * @param {ClientStorageService} ClientStorageService
       */
      ($rootScope, $scope, $state, $stateParams, CheckingAccountService, ClientStorageService) => {
        Promise
          .join(
            ClientStorageService.getValidToken(),
            ClientStorageService.get('me')
          )
          .spread((token, me) => {
            CheckingAccountService.listUserCheckingAccounts(me, {identifier: $stateParams.identifier}, token)
              .then((paginatedResult) => {
                let checkingAccount = paginatedResult.items[0]

                $scope.checkingAccount = checkingAccount
                $scope.$emit('checkingAccount', checkingAccount)
                $rootScope.checkingAccount = checkingAccount

                $scope.me = me
                $scope.$emit('me', me)

                $rootScope.windowTitle = checkingAccount.name

                let esc = new EventSourceConnection(jsonld.getRelLink('stream', checkingAccount), 'checkingAccountStream')
                esc.connect(token)
                $scope.$on('$destroy', () => {
                  esc.disconnect()
                })
                $scope.esc = esc
                $scope.$emit('esc', esc)

                $state.go('checking-account.spendings', {identifier: checkingAccount.identifier}, {location: 'replace'})
              })
          })
      }]
    )
}
