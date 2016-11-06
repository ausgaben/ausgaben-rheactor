'use strict'

const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')
const CheckingAccount = require('../../frontend/js/model/checking-account')
const CreateCheckingAccountCommand = require('../command/checking-account/create')
const UpdateCheckingAccountPropertyCommand = require('../command/checking-account/update-property')
const URIValue = require('rheactor-value-objects/uri')
const Promise = require('bluebird')
const Joi = require('joi')
const Pagination = require('rheactor-server/util/pagination')
const sendPaginatedListResponse = require('rheactor-server/api/pagination').sendPaginatedListResponse
const _merge = require('lodash/merge')
const checkVersion = require('rheactor-server/api/check-version')

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
module.exports = function (app, config, emitter, checkingAccountRepo, checkingAccountUserRepo, spendingRepo, userRepo, search, tokenAuth, jsonld, sendHttpProblem, transformer) {
  /**
   * Search checkingAccounts
   */
  app.post('/api/search/checking-account', tokenAuth, function (req, res) {
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
          .then(
            checkingAccounts => sendPaginatedListResponse(
              new URIValue(config.get('api_host')),
              req,
              res,
              CheckingAccount.$context,
              jsonld,
              checkingAccount => transformer(checkingAccount),
              checkingAccounts
            )
          )
      })
      .catch(sendHttpProblem.bind(null, res))
  })

  /**
   * Create a checking account
   */
  app.post('/api/checking-account', tokenAuth, function (req, res) {
    let schema = Joi.object().keys({
      name: Joi.string().min(1).required().trim(),
      monthly: Joi.boolean().default(false),
      savings: Joi.boolean().default(false)
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

  app.get('/api/checking-account/:id', tokenAuth, function (req, res) {
    return Promise
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
      .catch(sendHttpProblem.bind(null, res))
  })

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
          if (checkingAccount[v.value.property] === v.value.value) throw new ValidationFailedError(v.value.property + ' unchanged', v.value.value)
          return emitter.emit(new UpdateCheckingAccountPropertyCommand(checkingAccount, v.value.property, v.value.value, user))
            .then(() => checkingAccount)
        })
    })
    .then(checkingAccount => res.header('etag', checkingAccount.aggregateVersion()).header('last-modified', new Date(checkingAccount.modifiedAt()).toUTCString()).status(204).send())
    .catch(err => sendHttpProblem(res, err))
  )
}
