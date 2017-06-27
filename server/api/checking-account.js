import {ValidationFailedError, AccessDeniedError} from '@rheactorjs/errors'
import {CheckingAccount} from '../../build/js-es5/model/checking-account'
import CreateCheckingAccountCommand from '../command/checking-account/create'
import UpdateCheckingAccountPropertyCommand from '../command/checking-account/update-property'
import {URIValue} from '@rheactorjs/value-objects'
import Promise from 'bluebird'
import Joi from 'joi'
import {Pagination, sendPaginatedListResponse, checkVersion} from '@rheactorjs/server'
import _merge from 'lodash/merge'

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param {BackendEmitter} emitter
 * @param {CheckingAccountRepository} checkingAccountRepo
 * @param {CheckingAccountUserRepository} checkingAccountUserRepo
 * @param {SpendingRepository} spendingRepo
 * @param {UserRepository} userRepo
 * @param {Search} search
 * @param tokenAuth
 * @param {JSONLD} jsonld
 * @param {function} sendHttpProblem
 * @param {function} transformer
 */
export default (app,
                config,
                emitter,
                checkingAccountRepo,
                checkingAccountUserRepo,
                spendingRepo,
                userRepo,
                search,
                tokenAuth,
                jsonld,
                sendHttpProblem,
                transformer) => {
  /**
   * Search checkingAccounts
   */
  app.post('/api/search/checking-account', tokenAuth, (req, res) => {
    let schema = Joi.object().keys({
      user: Joi.number().min(1),
      identifier: Joi.alternatives().try(Joi.number().min(1), Joi.string().min(1)),
      offset: Joi.number().min(0)
    })
    Promise
      .try(() => {
        let query = _merge({}, req.body, req.query)
        query.user = req.user

        let v = Joi.validate(query, schema)
        if (v.error) {
          throw new ValidationFailedError('Validation failed', query, v.error)
        }

        let pagination = new Pagination(query.offset)
        return search.searchCheckingAccounts(query, pagination)
          .then(sendPaginatedListResponse.bind(null, new URIValue(config.get('api_host')), req, res, checkingAccount => transformer(checkingAccount)))
      })
      .catch(sendHttpProblem.bind(null, res))
  })

  /**
   * Create a checking account
   */
  app.post('/api/checking-account', tokenAuth, (req, res) => {
    const b = Joi.boolean().default(false).falsy([0, '0']).truthy([1, '1'])
    let schema = Joi.object().keys({
      name: Joi.string().min(1).required().trim(),
      monthly: b,
      savings: b
    })
    Promise
      .try(() => {
        let v = Joi.validate(req.body, schema)
        if (v.error) {
          throw new ValidationFailedError('Validation failed', req.body, v.error)
        }
        return userRepo.getById(req.user)
          .then((user) => {
            let cmd = new CreateCheckingAccountCommand(
              v.value.name,
              v.value.monthly,
              v.value.savings,
              user
            )
            return emitter.emit(cmd)
          })
          .then(
            /**
             * @param {CheckingAccountCreatedEvent} event
             * @returns {*}
             */
            (event) => {
              return res
                .header('Location', jsonld.createId(CheckingAccount.$context, event.aggregateId))
                .status(201)
                .send()
            })
      })
      .catch(sendHttpProblem.bind(null, res))
  })

  app.get('/api/checking-account/:id', tokenAuth, (req, res) => Promise
    .join(
      checkingAccountRepo.getById(req.params.id),
      checkingAccountUserRepo.findByCheckingAccountId(req.params.id).filter(checkingAccountUser => checkingAccountUser.user === req.user)
    )
    .spread((checkingAccount, checkingAccountUser) => {
      if (!checkingAccountUser) {
        throw new AccessDeniedError(req.url, 'Not your checking account!')
      }
      return res.send(transformer(checkingAccount))
    })
    .catch(sendHttpProblem.bind(null, res)))

  /**
   * Update a checking account
   */
  app.put('/api/checking-account/:id/:property', tokenAuth, (req, res) => Promise
    .try(() => {
      const schema = Joi.object().keys({
        id: Joi.string().min(1).trim(),
        property: Joi.string().only(['monthly', 'savings']).required().trim(),
        value: Joi.any().required()
      })
      const query = req.body
      query.id = req.params.id
      query.property = req.params.property
      const v = Joi.validate(query, schema)
      if (v.error) {
        throw new ValidationFailedError('Validation failed', query, v.error)
      }
      return Promise
        .join(
          checkingAccountRepo.getById(req.params.id),
          checkingAccountUserRepo.findByCheckingAccountId(req.params.id).filter(checkingAccountUser => checkingAccountUser.user === req.user),
          userRepo.getById(req.user)
        )
        .spread((checkingAccount, checkingAccountUser, user) => {
          if (!checkingAccountUser) {
            throw new AccessDeniedError(req.url, 'Not your checking account!')
          }
          checkVersion(req.headers['if-match'], checkingAccount)
          if (checkingAccount[v.value.property] === v.value.value) throw new ValidationFailedError(`${v.value.property} unchanged`, v.value.value)
          return emitter.emit(new UpdateCheckingAccountPropertyCommand(checkingAccount, v.value.property, v.value.value, user))
            .then(() => checkingAccount)
        })
    })
    .then(checkingAccount => res.header('etag', checkingAccount.aggregateVersion()).header('last-modified', new Date(checkingAccount.modifiedAt()).toUTCString()).status(204).send())
    .catch(err => sendHttpProblem(res, err))
  )
}
