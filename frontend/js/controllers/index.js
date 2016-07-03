'use strict'

module.exports = function (app) {
  require('./dashboard')(app)
  require('./checking-account')(app)
  require('rheactor-web-app/js/controller/navigation')(app)
  require('rheactor-web-app/js/controller/login')(app)
  require('rheactor-web-app/js/controller/register')(app)
  require('rheactor-web-app/js/controller/activation')(app)
  require('rheactor-web-app/js/controller/password-change')(app)
  require('rheactor-web-app/js/controller/logout')(app)
  require('rheactor-web-app/js/controller/account')(app)
  require('rheactor-web-app/js/controller/body')(app)
  require('rheactor-web-app/js/controller/bluebird')(app)
  require('rheactor-web-app/js/controller/window-title')(app)
  require('rheactor-web-app/js/controller/app-update')(app)
}
