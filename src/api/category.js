import {ValidationFailedError, AccessDeniedError} from '@rheactorjs/errors'
import {Category} from '@ausgaben/models'
import {URIValue} from '@rheactorjs/value-objects'
import Promise from 'bluebird'
import Joi from 'joi'
import {Pagination, sendPaginatedListResponse} from '@rheactorjs/server'
import _merge from 'lodash/merge'

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
export default (
  app,
  config,
  emitter,
  checkingAccountRepo,
  checkingAccountUserRepo,
  userRepo,
  search,
  tokenAuth,
  jsonld,
  sendHttpProblem,
  transformer
) => {
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
            .then(sendPaginatedListResponse.bind(null, new URIValue(config.get('api_host')), req, res, ({category}) => new Category(category)))
        })
    })
    .catch(sendHttpProblem.bind(null, res))
  )
}
