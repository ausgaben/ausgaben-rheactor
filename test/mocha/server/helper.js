import request from 'supertest'
import superagent from 'superagent'
import Promise from 'bluebird'
Promise.promisifyAll(request)

import backend from '../../../server/backend'

export function clearDb () {
  return backend.redis.client.flushdb()
}

export const redis = backend.redis.client
export const repositories = backend.repositories

// Configure parsing for superagent
superagent.serialize[backend.webConfig.mimeType] = JSON.stringify
