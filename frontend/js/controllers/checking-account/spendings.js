'use strict'

const waitFor = require('rheactor-web-app/js/util/wait-for')
const Promise = require('bluebird')
const Spending = require('../../model/spending')
const HttpProgress = require('rheactor-web-app/js/util/http').HttpProgress
const HttpProblem = require('rheactor-web-app/js/model/http-problem')

module.exports = (app) => {
  app
    .controller('CheckingAccountSpendingsController', ['$scope', '$state', '$window', '$timeout', '$stateParams', 'CheckingAccountService', 'SpendingService', 'ClientStorageService',
      /**
       * @param {object} $scope
       * @param {object} $state
       * @param {object} $window
       * @param {object} $timeout
       * @param {object} $stateParams
       * @param {CheckingAccountService} CheckingAccountService
       * @param {SpendingService} SpendingService
       * @param {ClientStorageService} ClientStorageService
       */
      ($scope, $state, $window, $timeout, $stateParams, CheckingAccountService, SpendingService, ClientStorageService) => {
        let vm = {
          checkingAccount: null,
          spendings: [],
          p: new HttpProgress()
        }

        let fetchSpendings = (list, token) => {
          list()
            .then((paginatedList) => {
              return Promise
                .map(paginatedList.items, spending => vm.spendings.push(new Spending(spending)))
                .then(() => {
                  if (paginatedList.hasNext) {
                    return fetchSpendings(
                      SpendingService.navigateList.bind(SpendingService, paginatedList, 'next', token),
                      token
                    )
                  }
                  return paginatedList
                })
            })
        }

        Promise
          .join(
            waitFor($scope, 'checkingAccount'),
            waitFor($scope, 'esc')
          )
          .spread((checkingAccount, esc) => {
            vm.checkingAccount = checkingAccount
            ClientStorageService.getValidToken()
              .then((token) => {
                fetchSpendings(SpendingService.findByCheckingAccount.bind(SpendingService, checkingAccount, token), token)
              })
            esc.subscribe((event, eventCreatedAt, payload) => {
              console.log(event, eventCreatedAt, payload)
            })
          })

        vm.submit = (spending) => {
          if (vm.p.$active) {
            return
          }
          vm.p.activity()
          ClientStorageService.getValidToken()
            .then((token) => {
              return SpendingService.create(vm.checkingAccount, spending, token)
            })
            .then(() => {
              vm.p.success()
            })
            .catch(HttpProblem, (httpProblem) => {
              vm.p.error(httpProblem)
            })
        }

        return vm
      }]
    )
}
