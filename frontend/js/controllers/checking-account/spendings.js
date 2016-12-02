'use strict'

const waitFor = require('rheactor-web-app/js/util/wait-for')
const Promise = require('bluebird')
const Spending = require('../../model/spending')
const LiveCollection = require('rheactor-web-app/js/util/live-collection')
const _reduce = require('lodash/reduce')
const _debounce = require('lodash/debounce')
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
          pending: 0,
          date: new Date()
        }
        let spendingsCollection

        const fetchSpendings = (list, token, forDate) => {
          list()
            .then((paginatedList) => {
              if (forDate !== vm.date.getTime()) {
                // User has navigate to a different month, abort
                return
              }
              return Promise
                .map(paginatedList.items, spending => spendingsCollection.items.push(new Spending(spending)))
                .then(() => {
                  if (paginatedList.hasNext) {
                    return fetchSpendings(
                      SpendingService.navigateList.bind(SpendingService, paginatedList, 'next', token),
                      token,
                      forDate
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
          vm.pending = 0
          groupSpendings(vm.pendingSpendings, spending => !spending.booked, spendingsCollection.items)
            .map(spending => {
              vm.pending += spending.amount
            })
        }

        const groupSpendings = (groupList, filterFunc, spendings) => {
          const group2entry = {}
          return Promise
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
              return spending
            })
        }

        const fetchSpendingsForMonth = _debounce(() => ClientStorageService
          .getValidToken()
          .then((token) => {
            const query = {}
            if (vm.checkingAccount.monthly) {
              const startDate = moment(vm.date).startOf('month')
              const endDate = moment(vm.date).endOf('month')
              query.dateFrom = startDate.toDate()
              query.dateTo = endDate.toDate()
            }
            fetchSpendings(SpendingService.findByCheckingAccount.bind(SpendingService, vm.checkingAccount, query, token), token, vm.date.getTime())
            ReportService.report(vm.checkingAccount, query, token)
              .then(report => {
                vm.report = report
              })
          }), 500)

        vm.toggleMonthly = () => ClientStorageService.getValidToken()
          .then((token) => {
            CheckingAccountService.updateProperty(vm.checkingAccount, 'monthly', !vm.checkingAccount.monthly, token)
          })

        $scope.$watch('vm.checkingAccount.savings', (newValue, oldValue) => {
          if (newValue === undefined || oldValue === undefined) return
          if (newValue === oldValue) return
          ClientStorageService.getValidToken()
            .then((token) => {
              CheckingAccountService.updateProperty(vm.checkingAccount, 'savings', newValue, token)
            })
        })

        vm.nextMonth = () => {
          spendingsCollection.items = []
          vm.date = moment(vm.date).add(1, 'month').toDate()
          fetchSpendingsForMonth()
        }

        vm.previousMonth = () => {
          spendingsCollection.items = []
          vm.date = moment(vm.date).subtract(1, 'month').toDate()
          fetchSpendingsForMonth()
        }

        // Init
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
          })
          .then(() => fetchSpendingsForMonth())

        return vm
      }]
    )
}
