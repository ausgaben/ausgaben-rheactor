'use strict'

const waitFor = require('rheactor-web-app/js/util/wait-for')
const HttpProgress = require('rheactor-web-app/js/util/http').HttpProgress
const HttpProblem = require('rheactor-web-app/js/model/http-problem')
const _merge = require('lodash/merge')
const Spending = require('../../model/spending')

module.exports = (app) => {
  app
    .controller('CheckingAccountSpendingController', ['$scope', '$state', '$stateParams', 'SpendingService', 'ClientStorageService', 'IDService',
      /**
       * @param {object} $scope
       * @param {object} $state
       * @param {object} $stateParams
       * @param {SpendingService} SpendingService
       * @param {ClientStorageService} ClientStorageService
       * @param {IDService} IDService
       */
      ($scope, $state, $stateParams, SpendingService, ClientStorageService, IDService) => {
        let vm = {
          p: new HttpProgress(),
          spending: new Spending({
            booked: true,
            bookedAt: new Date(),
            saving: false
          }),
          type: 'spending',
          checkingAccount: null
        }

        waitFor($scope, 'checkingAccount')
          .then(checkingAccount => {
            vm.checkingAccount = checkingAccount
            if ($stateParams['spending_id']) {
              ClientStorageService.getValidToken()
                .then(token => {
                  SpendingService.get(IDService.decode($stateParams['spending_id']), token)
                    .then(spending => {
                      vm.spending = new Spending(_merge({}, spending, {amount: Math.abs(spending.amount) / 100}))
                      vm.type = spending.amount > 0 ? 'income' : 'spending'
                      if (!vm.spending.booked) {
                        // Always set the date for pending spendings to today when opening them
                        vm.spending.bookedAt = new Date()
                      }
                    })
                })
            }
          })

        vm.submit = () => {
          if (vm.p.$active) {
            return
          }
          vm.p.activity()
          ClientStorageService.getValidToken()
            .then((token) => {
              const spending = _merge({}, vm.spending, {amount: Math.round((vm.type === 'spending' ? -vm.spending.amount : vm.spending.amount) * 100)})
              if (spending.$id) {
                return SpendingService.update(spending, token)
              } else {
                return SpendingService.create(vm.checkingAccount, spending, token)
              }
            })
            .then(() => {
              vm.p.success()
              $state.go('checking-account.spendings', {identifier: vm.checkingAccount.identifier})
            })
            .catch(HttpProblem, (httpProblem) => {
              vm.p.error(httpProblem)
            })
        }

        return vm
      }]
    )
}
