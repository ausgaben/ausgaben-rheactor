'use strict'

const HttpProgress = require('rheactor-web-app/js/util/http').HttpProgress
const HttpProblem = require('rheactor-web-app/js/model/http-problem')
const Promise = require('bluebird')

module.exports = function (app) {
  app
    .config(['$stateProvider', ($stateProvider) => {
      $stateProvider
        .state('dashboard', {
          url: '/dashboard',
          templateUrl: '/view/dashboard.html',
          title: 'Your checking accounts',
          controllerAs: 'vm',
          controller: ['$state', 'CheckingAccountService', 'ReportService', 'ClientStorageService',
            /**
             * @param {object} $state
             * @param {CheckingAccountService} CheckingAccountService
             * @param {ReportService} ReportService
             * @param {ClientStorageService} ClientStorageService
             */
            ($state, CheckingAccountService, ReportService, ClientStorageService) => {
              let vm = {
                paginatedList: false,
                p: new HttpProgress(),
                c: new HttpProgress(),
                balance: 0
              }

              let fetch = (list, token) => {
                if (vm.p.$active) {
                  return
                }
                vm.p.activity()
                list()
                  .then((paginatedList) => {
                    vm.paginatedList = paginatedList
                    Promise
                      .filter(paginatedList.items, checkingAccount => !checkingAccount.monthly)
                      .map(checkingAccount => ReportService.report(checkingAccount, {}, token))
                      .map(report => Promise.filter(vm.paginatedList.items, checkingAccount => checkingAccount.$id === report.checkingAccount.$id)
                        .spread(checkingAccount => {
                          checkingAccount.report = report
                          vm.balance += report.balance
                        }))
                    vm.p.success()
                  })
                  .catch(HttpProblem, (err) => {
                    vm.p.error(err)
                  })
              }

              Promise
                .join(
                  ClientStorageService.getValidToken(),
                  ClientStorageService.get('me')
                )
                .spread((token, me) => {
                  fetch(CheckingAccountService.listUserCheckingAccounts.bind(CheckingAccountService, me, {}, token), token)
                })

              vm.next = () => {
                return ClientStorageService.getValidToken()
                  .then((token) => {
                    fetch(CheckingAccountService.navigateList.bind(CheckingAccountService, vm.paginatedList, 'next', token), token)
                  })
              }
              vm.prev = () => {
                return ClientStorageService.getValidToken()
                  .then((token) => {
                    fetch(CheckingAccountService.navigateList.bind(CheckingAccountService, vm.paginatedList, 'prev', token), token)
                  })
              }

              vm.submit = (checkingAccount) => {
                if (vm.c.$active) {
                  return
                }
                vm.c.activity()
                return ClientStorageService.getValidToken()
                  .then((token) => {
                    return CheckingAccountService.create({name: checkingAccount.name}, token)
                      .then((checkingAccount) => {
                        $state.go('checking-account', {identifier: checkingAccount.identifier})
                        vm.c.success()
                      })
                      .catch(HttpProblem, (httpProblem) => {
                        vm.c.error(httpProblem)
                      })
                  })
              }

              return vm
            }]
        })
    }])
}
