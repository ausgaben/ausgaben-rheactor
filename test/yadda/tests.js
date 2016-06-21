'use strict'

let path = require('path')
let glob = require('glob')
let app = require('../../server/server')
let runner = require('rheactor-yadda-feature-runner')(app)

// Configure parsing for superagent
require('superagent').serialize[app.config.get('mime_type')] = JSON.stringify

app.redis.flushdb()

var apiFeaturesDir = path.normalize(path.join(__dirname, '/../../features/api'))
var rheactorServerContextDir = path.normalize(path.join(__dirname, '/../../node_modules/rheactor-server/features/context/*.js'))
runner.run(glob.sync(apiFeaturesDir + '/*.feature'), glob.sync(rheactorServerContextDir))
