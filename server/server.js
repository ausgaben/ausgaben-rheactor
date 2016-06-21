'use strict'

const backend = require('./backend')
const config = backend.config
const redis = backend.redis.client
const repositories = backend.repositories
const emitter = backend.emitter
const appName = backend.appName
const search = backend.search

// HTTP API
const express = require('express')
const app = express()
require('./config/express')(app, config, repositories, search, emitter)
if (config.get('environment') === 'development') {
  app.set('showStackError', true)
  app.use(express.static(config.get('root') + '/build'))
  console.log('Serving static files for ' + config.get('root') + '/build')
}
const port = config.get('port')
const host = config.get('host')
app.listen(port, host)
console.log(appName + ' (Node ' + process.version + ') started at ' + host + ':' + port)
console.log('Web:', config.get('web_host'))
console.log('API:', config.get('api_host'))
module.exports = {
  app,
  repositories,
  redis,
  config
}
