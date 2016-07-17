'use strict'

const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')
const Spending = require('../../frontend/js/model/spending')
const CreateSpendingCommand = require('../command/spending/create')
const URIValue = require('rheactor-value-objects/uri')
const Promise = require('bluebird')
const Joi = require('joi')
const Pagination = require('rheactor-server/util/pagination')
const sendPaginatedListResponse = require('rheactor-server/api/pagination').sendPaginatedListResponse
const _merge = require('lodash/merge')
const SpendingTypeValue = require('../valueobject/spending-type')

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
            let query = _merge(
              {},
              {
                checkingAccount: req.params.id
              },
              req.body,
              req.query
            )

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
      type: Joi.string().min(1).required().trim(),
      category: Joi.string().min(1).required().trim(),
      title: Joi.string().min(1).required().trim(),
      amount: Joi.number().integer().required(),
      booked: Joi.boolean().required(),
      bookedAt: Joi.date(),
      paidWith: Joi.string().min(1).trim() // FIXME: Implement
    })
    Promise
      .try(() => {
        let v = Joi.validate(req.body, schema)
        if (v.error) {
          console.error(v.error)
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
              new SpendingTypeValue(v.value.type),
              v.value.category,
              v.value.title,
              v.value.amount,
              v.value.booked,
              v.value.bookedAt ? new Date(v.value.bookedAt).getTime() : undefined,
              user
            )
            return emitter.emit(cmd)
          })
          .then(
            /**
             * @param {SpendingCreatedEvent} event
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
            return res.send(transformer(spending))
          })
      })
      .catch(sendHttpProblem.bind(null, res))
  })
}
