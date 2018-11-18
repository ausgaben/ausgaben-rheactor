'use strict'

const path = require('path')
const glob = require('glob')
const app = require('../../server/server')
const runner = require('rheactor-yadda-feature-runner')(app)

// Configure parsing for superagent
require('superagent').serialize[app.webConfig.mimeType] = JSON.stringify

app.redis.flushdb()

var apiFeaturesDir = path.normalize(path.join(__dirname, '/../../features/api'))
var rheactorServerContextDir = path.normalize(path.join(__dirname, '/../../node_modules/rheactor-server/features/context/*.js'))
runner.run(glob.sync(apiFeaturesDir + '/*.feature'), glob.sync(rheactorServerContextDir))