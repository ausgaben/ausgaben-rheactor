'use strict'

const path = require('path')
const backend = require('./backend')
const config = backend.config
const webConfig = backend.webConfig
const redis = backend.redis.client
const repositories = backend.repositories
const emitter = backend.emitter
const appName = backend.appName
const search = backend.search

// HTTP API
const express = require('express')
const app = express()
require('./config/express')(app, config, webConfig, repositories, search, emitter)
if (config.get('environment') === 'development') {
  app.set('showStackError', true)
  const buildDir = path.normalize(path.join(__dirname, '/../build'))
  app.use(express.static(buildDir))
  console.log('Serving static files for ' + buildDir)
}
const port = config.get('port')
const host = config.get('host')
app.listen(port, host)
console.log(appName + ' (Node ' + process.version + ') started at ' + host + ':' + port)
console.log('Web:', config.get('web_host') + webConfig.baseHref)
console.log('API:', config.get('api_host'))
module.exports = {
  app,
  repositories,
  redis,
  config,
  webConfig
}
