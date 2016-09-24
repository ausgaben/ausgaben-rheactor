'use strict'

const waitFor = require('rheactor-web-app/js/util/wait-for')
const Promise = require('bluebird')
const Spending = require('../../model/spending')
const LiveCollection = require('rheactor-web-app/js/util/live-collection')
const _reduce = require('lodash/reduce')
const moment = require('moment')

module.exports = (app) => {
  app
    .controller('CheckingAccountSpendingsController', ['$scope', '$state', '$window', '$timeout', '$stateParams', 'CheckingAccountService', 'SpendingService', 'ReportService', 'ClientStorageService',
      /**
       * @param {object} $scope
       * @param {object} $state
       * @param {object} $window
       * @param {object} $timeout
       * @param {object} $stateParams
       * @param {CheckingAccountService} CheckingAccountService
       * @param {SpendingService} SpendingService
       * @param {ReportService} ReportService
       * @param {ClientStorageService} ClientStorageService
       */
      ($scope, $state, $window, $timeout, $stateParams, CheckingAccountService, SpendingService, ReportService, ClientStorageService) => {
        let vm = {
          checkingAccount: null,
          bookedSpendings: [],
          pendingSpendings: [],
          date: new Date()
        }
        let spendingsCollection

        const fetchSpendings = (list, token) => {
          list()
            .then((paginatedList) => {
              return Promise
                .map(paginatedList.items, spending => spendingsCollection.items.push(new Spending(spending)))
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
            .then(updateGroupedSpendings)
        }

        function SpendingGroup (title) {
          this.title = title
          this.spendings = []
        }

        /**
         * @return {Number} total of all spendings for this group
         */
        SpendingGroup.prototype.total = function () {
          const self = this
          return _reduce(self.spendings, (total, spending) => total + spending.amount, 0)
        }

        const updateGroupedSpendings = () => {
          vm.bookedSpendings = []
          vm.pendingSpendings = []
          groupSpendings(vm.bookedSpendings, spending => spending.booked, spendingsCollection.items)
          groupSpendings(vm.pendingSpendings, spending => !spending.booked, spendingsCollection.items)
        }

        const groupSpendings = (groupList, filterFunc, spendings) => {
          const group2entry = {}
          Promise
            .filter(spendings, filterFunc)
            .map(spending => {
              let group
              if (group2entry[spending.category]) {
                group = group2entry[spending.category]
              } else {
                group = new SpendingGroup(spending.category)
                group2entry[spending.category] = group
                groupList.push(group)
              }
              group.spendings.push(spending)
            })
        }

        Promise
          .join(
            waitFor($scope, 'checkingAccount'),
            waitFor($scope, 'mec')
          )
          .spread((checkingAccount, mec) => {
            vm.checkingAccount = checkingAccount
            spendingsCollection = new LiveCollection([], mec)
            spendingsCollection.subscribe((spending) => {
              console.log('updated', spending)
            })
            mec.subscribe(event => {
              switch (event.name) {
                case 'SpendingCreatedEvent':
                  let spending = new Spending(event.entity)
                  spendingsCollection.items.push(spending)
                  vm.checkingAccount.balance += spending.amount
                  if (spending.amount > 0) {
                    vm.checkingAccount.income += spending.amount
                  } else {
                    vm.checkingAccount.spendings += spending.amount
                  }
                  updateGroupedSpendings()
                  break
              }
            })
            ClientStorageService.getValidToken()
              .then((token) => {
                const query = {}
                if (vm.checkingAccount.monthly) {
                  const startDate = moment(vm.date).startOf('month')
                  const endDate = moment(vm.date).endOf('month')
                  query.dateFrom = startDate.toDate()
                  query.dateTo = endDate.toDate()
                }
                fetchSpendings(SpendingService.findByCheckingAccount.bind(SpendingService, checkingAccount, query, token), token)
                ReportService.report(checkingAccount, query, token)
                  .then(report => {
                    vm.report = report
                  })
              })
          })

        vm.toggleMonthly = () => ClientStorageService.getValidToken()
          .then((token) => {
            CheckingAccountService.updateProperty(vm.checkingAccount, 'monthly', !vm.checkingAccount.monthly, token)
          })

        return vm
      }]
    )
}
