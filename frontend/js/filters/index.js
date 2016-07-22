'use strict'

require('angular')
  .module('AusgabenFilterModule', [])
  .filter('money', [() => require('./money')])
