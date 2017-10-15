import request from 'supertest'
import superagent from 'superagent'
import Promise from 'bluebird'
import backend from '../../../src/backend'

Promise.promisifyAll(request)

export function clearDb () {
  return backend.redis.client.flushdb()
}

export const redis = backend.redis.client
export const repositories = backend.repositories

// Configure parsing for superagent
superagent.serialize[backend.webConfig.mimeType] = JSON.stringify
