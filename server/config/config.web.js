'use strict'

const config = require('./config')
const pjson = require('../../package.json')

module.exports = {
  app: config.get('app'),
  environment: config.get('environment'),
  version: config.get('version'),
  appName: pjson.appName,
  description: pjson.description,
  apiIndex: config.get('api_host') + '/api',
  apiHost: config.get('api_host'),
  webHost: config.get('web_host'),
  baseHref: '/',
  mimeType: 'application/vnd.ausgaben.v1+json'
}
