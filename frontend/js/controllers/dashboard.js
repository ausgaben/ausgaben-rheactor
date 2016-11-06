'use strict'

const HttpProgress = require('rheactor-web-app/js/util/http').HttpProgress
const HttpProblem = require('rheactor-web-app/js/model/http-problem')
const Promise = require('bluebird')
const moment = require('moment')

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
                checkingAccounts: [],
                savingsAccounts: [],
                c: new HttpProgress(),
                balanceSavings: 0,
                balanceCheckings: 0
              }
              const accounts = []

              let fetch = (list, token) => {
                list()
                  .then((paginatedList) => {
                    Promise
                      .map(paginatedList.items, account => {
                        if (account.savings) {
                          vm.savingsAccounts.push(account)
                        } else {
                          vm.checkingAccounts.push(account)
                        }
                        accounts.push(account)
                      })
                    Promise
                      .map(paginatedList.items, checkingAccount => {
                        if (checkingAccount.monthly) {
                          const query = {}
                          const startDate = moment().startOf('month')
                          const endDate = moment().endOf('month')
                          query.dateFrom = startDate.toDate()
                          query.dateTo = endDate.toDate()
                          return ReportService.report(checkingAccount, query, token)
                        }
                        return ReportService.report(checkingAccount, {}, token)
                      })
                      .map(report => Promise.filter(accounts, checkingAccount => checkingAccount.$id === report.checkingAccount.$id)
                        .spread(checkingAccount => {
                          checkingAccount.report = report
                          if (checkingAccount.savings) {
                            vm.balanceSavings += report.balance
                          } else {
                            vm.balanceCheckings += report.balance
                          }
                        }))
                    if (paginatedList.hasNext) {
                      return fetch(CheckingAccountService.navigateList.bind(CheckingAccountService, paginatedList, 'next', token), token)
                    }
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
