import SpendingBookedAtIndex from '../services/index/spending-bookedat'
import Promise from 'bluebird'

export default {
  description: 'rebuild all search indices',
  action: (backend) => {
    let ss = new SpendingBookedAtIndex(backend.repositories, backend.redis.client, backend.emitter)
    return Promise.join(ss.index())
  }
}
