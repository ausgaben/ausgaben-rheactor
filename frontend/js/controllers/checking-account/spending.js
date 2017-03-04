import {waitFor, HttpProgress, JSONLD} from 'rheactor-web-app'
import {HttpProblem} from 'rheactor-models'
import _merge from 'lodash/merge'
import {Spending} from '../../model/spending'
import debounce from 'lodash/debounce'

export default (app) => {
  app
    .controller('CheckingAccountSpendingController', ['$window', '$scope', '$state', '$stateParams', 'SpendingService', 'ClientStorageService', 'CategoryService', 'TitleService', 'IDService',
      /**
       * @param {object} $window
       * @param {object} $scope
       * @param {object} $state
       * @param {object} $stateParams
       * @param {SpendingService} SpendingService
       * @param {CategoryService} CategoryService
       * @param {TitleService} TitleService
       * @param {ClientStorageService} ClientStorageService
       * @param {IDService} IDService
       */
      ($window, $scope, $state, $stateParams, SpendingService, ClientStorageService, CategoryService, TitleService, IDService) => {
        let vm = {
          p: new HttpProgress(),
          spending: new Spending({
            booked: true,
            bookedAt: new Date(),
            saving: false
          }),
          type: 'spending',
          checkingAccount: null,
          categoriesMatch: [],
          titlesMatch: []
        }

        waitFor($scope, 'checkingAccount')
          .then(checkingAccount => {
            vm.checkingAccount = checkingAccount
            if (checkingAccount.savings) {
              vm.type = 'income'
            }
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

        vm.delete = () => {
          if (vm.p.$active) {
            return
          }
          if (!$window.confirm('Really delete this spending?')) return
          vm.p.activity()
          ClientStorageService.getValidToken()
            .then((token) => SpendingService.delete(vm.spending, token))
            .then(() => {
              vm.p.success()
              $state.go('checking-account.spendings', {identifier: vm.checkingAccount.identifier})
            })
            .catch(HttpProblem, (httpProblem) => {
              vm.p.error(httpProblem)
            })
        }

        vm.lookupCategory = debounce(() => {
          if (!vm.spending.category || !vm.spending.category.length) {
            vm.categoriesMatch = []
            return
          }
          ClientStorageService.getValidToken()
            .then((token) => CategoryService.list(JSONLD.getRelLink('categories', vm.checkingAccount), {q: vm.spending.category}, token))
            .then(listResponse => {
              vm.categoriesMatch = listResponse.items
            })
        }, 250)

        vm.lookupTitle = debounce(() => {
          if (!vm.spending.category || !vm.spending.category.length || !vm.spending.title || !vm.spending.title.length) {
            vm.titlesMatch = []
            return
          }
          ClientStorageService.getValidToken()
            .then((token) => TitleService.list(JSONLD.getRelLink('titles', vm.checkingAccount), {category: vm.spending.category, q: vm.spending.title}, token))
            .then(listResponse => {
              vm.titlesMatch = listResponse.items
            })
        }, 250)

        return vm
      }]
    )
}
