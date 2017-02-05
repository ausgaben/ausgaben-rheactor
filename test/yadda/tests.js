import path from 'path'
import glob from 'glob'
import app from '../../server/server'
const runner = require('rheactor-yadda-feature-runner')(app)

// Configure parsing for superagent
require('superagent').serialize[app.webConfig.mimeType] = JSON.stringify

app.redis.flushdb()

const apiFeaturesDir = path.normalize(path.join(__dirname, '/../../features/api'))
const rheactorServerContextDir = path.normalize(path.join(__dirname, '/../../node_modules/rheactor-server/features/context/*.js'))
runner.run(glob.sync(`${apiFeaturesDir}/*.feature`), glob.sync(rheactorServerContextDir))
