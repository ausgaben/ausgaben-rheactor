import path from 'path'
import backend from './backend'
const config = backend.config
const webConfig = backend.webConfig
const redis = backend.redis.client
const repositories = backend.repositories
const emitter = backend.emitter
const appName = backend.appName
const search = backend.search

// HTTP API
import express from 'express'
import expressConfig from './config/express'

const app = express()
expressConfig(app, config, webConfig, repositories, search, emitter)
if (config.get('environment') === 'development') {
  app.set('showStackError', true)
  const buildDir = path.normalize(path.join(__dirname, '/../build'))
  app.use(express.static(buildDir))
  console.log(`Serving static files for ${buildDir}`)
}
const port = config.get('port')
const host = config.get('host')
app.listen(port, host)
console.log(`${appName} (Node ${process.version}) started at ${host}:${port}`)
console.log('Web:', config.get('web_host') + webConfig.baseHref)
console.log('API:', config.get('api_host'))

export default {
  app,
  repositories,
  redis,
  config,
  webConfig
}
