/* global beforeAll */

import path from 'path'
import glob from 'glob'
import app from '../../src/server'
import runner from '@rheactorjs/yadda-feature-runner'
import superagent from 'superagent'
import {TimeContext, RestClientContext, InternalContext} from '@rheactorjs/bdd-contexts'

const featureRunner = runner(app)

// Configure parsing for superagent
superagent.serialize[app.webConfig.mimeType] = JSON.stringify

app.app.set('env', 'test') // Suppress errors logged from express.js

beforeAll(() => new Promise((resolve, reject) => {
  app.redis.flushdb((err, succeeded) => {
    if (err) return reject(err)
    if (!succeeded) return reject(new Error('Failed to flush db.'))
    return resolve()
  })
}))

const apiFeaturesDir = path.normalize(path.join(__dirname, '/../../features/api'))

featureRunner.run(glob.sync(`${apiFeaturesDir}/*.feature`), [TimeContext, RestClientContext, InternalContext])
