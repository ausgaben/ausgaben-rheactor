'use strict'

const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')
const Spending = require('../../frontend/js/model/spending')
const CreateSpendingCommand = require('../command/spending/create')
const UpdateSpendingCommand = require('../command/spending/update')
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
   * Search spendings in the given checking account
   */
  app.post('/api/checking-account/:id/search/spending', tokenAuth, function (req, res) {
    return checkingAccountUserRepo.findByCheckingAccountId(req.params.id).filter(checkingAccountUser => checkingAccountUser.user === req.user)
      .then((checkingAccountUser) => {
        if (!checkingAccountUser) {
          throw new AccessDeniedError(req.url, 'Not your checking account!')
        }
        let schema = Joi.object().keys({
          checkingAccount: Joi.number().min(1),
          offset: Joi.number().min(0)
        })
        return Promise
          .try(() => {
            let query = _merge({}, req.body, req.query)
            query.checkingAccount = req.params.id

            let v = Joi.validate(query, schema)
            if (v.error) {
              throw new ValidationFailedError('Validation failed', query, v.error)
            }

            let pagination = new Pagination(query.offset)
            return search.searchSpendings(query, pagination)
              .then(sendPaginatedListResponse.bind(null, new URIValue(config.get('api_host')), req, res, Spending.$context, jsonld, (spending) => {
                return transformer(spending)
              }))
          })
      })
      .catch(sendHttpProblem.bind(null, res))
  })

  /**
   * Create a spending in the given checking account
   */
  app.post('/api/checking-account/:id/spending', tokenAuth, function (req, res) {
    let schema = Joi.object().keys({
      category: Joi.string().min(1).required().trim(),
      title: Joi.string().min(1).required().trim(),
      amount: Joi.number().integer().required(),
      booked: Joi.boolean().required(),
      bookedAt: Joi.date(),
      saving: Joi.boolean().default(false),
      paidWith: Joi.string().min(1).trim() // FIXME: Implement
    })
    Promise
      .try(() => {
        let v = Joi.validate(req.body, schema)
        if (v.error) {
          throw new ValidationFailedError('Validation failed', req.body, v.error)
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
            let cmd = new CreateSpendingCommand(
              checkingAccount,
              v.value.category,
              v.value.title,
              v.value.amount,
              v.value.booked,
              v.value.bookedAt ? new Date(v.value.bookedAt).getTime() : undefined,
              v.value.saving,
              user
            )
            return emitter.emit(cmd)
          })
          .then(
            /**
             * @param {SpendingUpdatedEvent} event
             * @returns {*}
             */
            (event) => {
              return res
                .header('Location', jsonld.createId(Spending.$context, event.aggregateId))
                .status(201)
                .send()
            })
      })
      .catch(sendHttpProblem.bind(null, res))
  })

  app.get('/api/spending/:id', tokenAuth, function (req, res) {
    spendingRepo.getById(req.params.id)
      .then((spending) => {
        return checkingAccountUserRepo.findByCheckingAccountId(spending.checkingAccount).filter(checkingAccountUser => checkingAccountUser.user === req.user)
          .then((checkingAccountUser) => {
            if (!checkingAccountUser) {
              throw new AccessDeniedError(req.url, 'Not your checking account!')
            }
          })
          .then(() => res
            .header('etag', spending.aggregateVersion())
            .header('last-modified', new Date(spending.modifiedAt()).toUTCString())
            .send(transformer(spending)))
      })
      .catch(sendHttpProblem.bind(null, res))
  })

  /**
   * Update a spending
   */
  app.put('/api/spending/:id', tokenAuth, function (req, res) {
    let schema = Joi.object().keys({
      category: Joi.string().min(1).trim(),
      title: Joi.string().min(1).trim(),
      amount: Joi.number().integer(),
      booked: Joi.boolean(),
      bookedAt: Joi.date(),
      saving: Joi.boolean(),
      paidWith: Joi.string().min(1).trim() // FIXME: Implement
    })
    Promise
      .try(() => {
        let v = Joi.validate(req.body, schema)
        if (v.error) {
          throw new ValidationFailedError('Validation failed', req.body, v.error)
        }
        return spendingRepo.getById(req.params.id)
          .then(spending => {
            checkVersion(req.headers['if-match'], spending)
            return spending
          })
          .then(spending => Promise
            .join(
              checkingAccountUserRepo.findByCheckingAccountId(req.params.id).filter(checkingAccountUser => checkingAccountUser.user === req.user),
              userRepo.getById(req.user)
            )
            .spread((checkingAccountUser, user) => {
              if (!checkingAccountUser) {
                throw new AccessDeniedError(req.url, 'Not your checking account!')
              }
              let cmd = new UpdateSpendingCommand(
                spending,
                v.value.category,
                v.value.title,
                v.value.amount,
                v.value.booked,
                v.value.bookedAt ? new Date(v.value.bookedAt).getTime() : undefined,
                v.value.saving,
                user
              )
              return emitter.emit(cmd)
            })
            .then(
              /**
               * @param {SpendingUpdatedEvent} event
               * @returns {*}
               */
              event => res
                .header('Location', jsonld.createId(Spending.$context, event.aggregateId))
                .header('etag', spending.aggregateVersion())
                .header('last-modified', new Date(spending.modifiedAt()).toUTCString())
                .status(204)
                .send()
            )
          )
      })
      .catch(sendHttpProblem.bind(null, res))
  })
}
