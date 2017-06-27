import path from 'path'
import glob from 'glob'
import app from '../../server/server'
import runner from '@rheactorjs/yadda-feature-runner'
import superagent from 'superagent'
import {TimeContext, RestClientContext, InternalContext} from '@rheactorjs/bdd-contexts'

const featureRunner = runner(app)

// Configure parsing for superagent
superagent.serialize[app.webConfig.mimeType] = JSON.stringify

app.redis.flushdb()
app.app.set('env', 'test') // Suppress errors logged from express.js

const apiFeaturesDir = path.normalize(path.join(__dirname, '/../../features/api'))

featureRunner.run(glob.sync(`${apiFeaturesDir}/*.feature`), [TimeContext, RestClientContext, InternalContext])
