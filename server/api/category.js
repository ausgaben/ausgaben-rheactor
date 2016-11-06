'use strict'

const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')
const Category = require('../../frontend/js/model/category')
const URIValue = require('rheactor-value-objects/uri')
const Promise = require('bluebird')
const Joi = require('joi')
const Pagination = require('rheactor-server/util/pagination')
const sendPaginatedListResponse = require('rheactor-server/api/pagination').sendPaginatedListResponse
const _merge = require('lodash/merge')

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param {BackendEmitter} emitter
 * @param {CheckingAccountRepository} checkingAccountRepo
 * @param {CheckingAccountUserRepository} checkingAccountUserRepo
 * @param {UserRepository} userRepo
 * @param {Search} search
 * @param tokenAuth
 * @param {JSONLD} jsonld
 * @param {function} sendHttpProblem
 * @param {function} transformer
 */
module.exports = function (app, config, emitter, checkingAccountRepo, checkingAccountUserRepo, userRepo, search, tokenAuth, jsonld, sendHttpProblem, transformer) {
  /**
   * Search categorys in the given checking account
   */
  app.post('/api/checking-account/:id/search/category', tokenAuth, (req, res) => Promise
    .try(() => {
      const schema = Joi.object().keys({
        checkingAccount: Joi.number().min(1),
        q: Joi.string().trim()
      })

      const query = _merge({}, req.body, req.query)
      query.checkingAccount = req.params.id

      const v = Joi.validate(query, schema)
      if (v.error) {
        throw new ValidationFailedError('Validation failed', query, v.error)
      }

      return checkingAccountUserRepo.findByCheckingAccountId(req.params.id)
        .filter(checkingAccountUser => checkingAccountUser.user === req.user)
        .then(checkingAccountUser => {
          if (!checkingAccountUser) {
            throw new AccessDeniedError(req.url, 'Not your checking account!')
          }

          let pagination = new Pagination(query.offset)
          return search.searchCategories(query, pagination)
            .then(sendPaginatedListResponse.bind(null, new URIValue(config.get('api_host')), req, res, Category.$context, jsonld, (category) => {
              return new Category(category)
            }))
        })
    })
    .catch(sendHttpProblem.bind(null, res))
  )
}
