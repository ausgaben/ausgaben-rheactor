require('angular')
  .module('AusgabenFilterModule', [])
  .filter('money', [() => require('./money')])
  .filter('percent', [() => require('./percent')])
