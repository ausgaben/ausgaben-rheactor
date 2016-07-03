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
          title: 'Your meetings',
          controllerAs: 'vm',
          controller: ['$state', 'MeetingService', 'ClientStorageService',
            /**
             * @param {object} $state
             * @param {MeetingService} MeetingService
             * @param {ClientStorageService} ClientStorageService
             */
            ($state, MeetingService, ClientStorageService) => {
              let vm = {
                paginatedList: false,
                p: new HttpProgress(),
                c: new HttpProgress()
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
                      .map(paginatedList.items, (meeting) => {
                        meeting.isHost = meeting.host.$id === token.sub
                      })
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
                  fetch(MeetingService.listUserMeetings.bind(MeetingService, me, {}, token), token)
                })

              vm.next = () => {
                return ClientStorageService.getValidToken()
                  .then((token) => {
                    fetch(MeetingService.navigateList.bind(MeetingService, vm.paginatedList, 'next', token), token)
                  })
              }
              vm.prev = () => {
                return ClientStorageService.getValidToken()
                  .then((token) => {
                    fetch(MeetingService.navigateList.bind(MeetingService, vm.paginatedList, 'prev', token), token)
                  })
              }

              vm.submit = (meeting) => {
                if (vm.c.$active) {
                  return
                }
                vm.c.activity()
                return ClientStorageService.getValidToken()
                  .then((token) => {
                    return MeetingService.create({name: meeting.name}, token)
                      .then((meeting) => {
                        $state.go('meeting', {identifier: meeting.identifier})
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
