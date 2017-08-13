import Promise from 'bluebird'
import {CheckingAccountUserCreatedEvent} from '../events'
import SpendingBookedAtIndex from './index/spending-bookedat'
import CategoriesIndex from './index/categories'
import TitlesIndex from './index/titles'
import _intersection from 'lodash/intersection'

/**
 * The search service knows about the various repositories and how to use their indices to optimize the search
 *
 * It also maintains own indices
 *
 * @param repositories
 * @param redis
 * @param {BackendEmitter} emitter
 * @constructor
 */
class Search {
  constructor (repositories, redis, emitter) {
    Object.defineProperty(this, 'repositories', {value: repositories})
    Object.defineProperty(this, 'redis', {value: redis})
    Object.defineProperty(this, 'emitter', {value: emitter})
    this.spendingBookedAtIndex = new SpendingBookedAtIndex(repositories, redis, emitter)
    this.categoriesIndex = new CategoriesIndex(repositories, redis, emitter)
    this.titlesIndex = new TitlesIndex(repositories, redis, emitter)
    emitter.on(emitter.toEventName(CheckingAccountUserCreatedEvent),
      /**
       * @param {CheckingAccountUserCreatedEvent} event
       */
      (event) => {
        redis.saddAsync(`search:user-checking-account:${event.data.user}`, event.data.checkingAccount)
      }
    )
  }

  /**
   * Search checking accounts
   *
   * @param {Object} query
   * @param {Pagination} pagination
   * @return PaginatedResult
   */
  searchCheckingAccounts (query, pagination) {
    let sets = [
      `search:user-checking-account:${query.user}`
    ]
    let total
    return Promise
      .resolve(this.redis.sinterAsync(...sets))
      .filter(id => query.identifier ? id === query.identifier : true)
      .then((ids) => {
        total = ids.length
        return pagination.splice(ids)
      })
      .map(this.repositories.checkingAccount.getById.bind(this.repositories.checkingAccount))
      .then((items) => {
        return pagination.result(items, total, query)
      })
  }

  /**
   * Search spendings
   *
   * @param {Object} query
   * @param {Pagination} pagination
   * @return PaginatedResult
   */
  searchSpendings (query, pagination) {
    let sets = [
      `${this.repositories.spending.alias}:checkingAccount:${query.checkingAccount}`
    ]
    let total
    return Promise
      .resolve(this.redis.sinterAsync(...sets))
      .then((ids) => {
        if (!query.dateFrom && !query.dateTo) return ids
        const from = query.dateFrom ? new Date(query.dateFrom) : false
        const to = query.dateTo ? new Date(query.dateTo) : false
        return this.spendingBookedAtIndex.range(query.checkingAccount, from, to)
          .then(dateIds => _intersection(dateIds, ids))
      })
      .then(ids => {
        total = ids.length
        return pagination.splice(ids)
      })
      .map(this.repositories.spending.getById.bind(this.repositories.spending))
      .then((items) => {
        return pagination.result(items, total, query)
      })
  }

  /**
   * Search periodicals
   *
   * @param {Object} query
   * @param {Pagination} pagination
   * @return PaginatedResult
   */
  searchPeriodicals (query, pagination) {
    let sets = [
      `${this.repositories.periodical.alias}:checkingAccount:${query.checkingAccount}`
    ]
    let total
    return Promise
      .resolve(this.redis.sinterAsync(...sets))
      .then((ids) => {
        total = ids.length
        return pagination.splice(ids)
      })
      .map(this.repositories.periodical.getById.bind(this.repositories.periodical))
      .then((items) => {
        return pagination.result(items, total, query)
      })
  }

  /**
   * Search categories
   *
   * @param {Object} query
   * @param {Pagination} pagination
   * @return PaginatedResult
   */
  searchCategories (query, pagination) {
    let total
    return this.categoriesIndex.all(query.checkingAccount)
      .filter(category => {
        if (!query.q) return true
        return category.toLowerCase().indexOf(query.q.toLowerCase()) >= 0
      })
      .then((categories) => {
        total = categories.length
        return pagination.splice(categories)
      })
      .map(category => ({category}))
      .then((items) => pagination.result(items, total, query))
  }

  /**
   * Search titles
   *
   * @param {Object} query
   * @param {Pagination} pagination
   * @return PaginatedResult
   */
  searchTitles (query, pagination) {
    let total
    return this.titlesIndex.all(query.checkingAccount, query.category)
      .filter(category => {
        if (!query.q) return true
        return category.toLowerCase().indexOf(query.q.toLowerCase()) >= 0
      })
      .then((titles) => {
        total = titles.length
        return pagination.splice(titles)
      })
      .map(title => ({title}))
      .then(items => pagination.result(items, total, query))
  }
}

export default Search
