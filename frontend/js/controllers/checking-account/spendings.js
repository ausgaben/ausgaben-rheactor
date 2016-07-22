'use strict'

const waitFor = require('rheactor-web-app/js/util/wait-for')
const Promise = require('bluebird')
const Spending = require('../../model/spending')
const HttpProgress = require('rheactor-web-app/js/util/http').HttpProgress
const HttpProblem = require('rheactor-web-app/js/model/http-problem')
const LiveCollection = require('rheactor-web-app/js/util/live-collection')
const _reduce = require('lodash/reduce')
const _merge = require('lodash/merge')

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
          spendingGroups: [],
          p: new HttpProgress(),
          spendingData: {
            type: 'spending',
            booked: true,
            bookedAt: new Date(),
            saving: false
          }
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

        let group2entry = {}

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
          vm.spendingGroups = []
          group2entry = {}
          Promise
            .map(spendingsCollection.items, spending => {
              let group
              if (group2entry[spending.category]) {
                group = group2entry[spending.category]
              } else {
                group = new SpendingGroup(spending.category)
                group2entry[spending.category] = group
                vm.spendingGroups.push(group)
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
                fetchSpendings(SpendingService.findByCheckingAccount.bind(SpendingService, checkingAccount, token), token)
              })
          })

        vm.submit = (data) => {
          if (vm.p.$active) {
            return
          }
          vm.p.activity()
          ClientStorageService.getValidToken()
            .then((token) => {
              const spending = _merge({}, data, {amount: Math.round((data.type === 'spending' ? -data.amount : data.amount) * 100)})
              delete spending.type
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
