'use strict'

const Promise = require('bluebird')
const ModelEventConnection = require('rheactor-web-app/js/util/model-event-connection')
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

                let mec = new ModelEventConnection(jsonld.getRelLink('stream', checkingAccount))
                mec.connect(token)
                $scope.$on('$destroy', () => {
                  mec.disconnect()
                })
                $scope.mec = mec
                $scope.$emit('mec', mec)

                $state.go('checking-account.spendings', {identifier: checkingAccount.identifier}, {location: 'replace'})
              })
          })
      }]
    )
}
