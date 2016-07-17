'use strict'

const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')
const CheckingAccount = require('../../frontend/js/model/checking-account')
const CreateCheckingAccountCommand = require('../command/checking-account/create')
const URIValue = require('rheactor-value-objects/uri')
const Promise = require('bluebird')
const Joi = require('joi')
const Pagination = require('rheactor-server/util/pagination')
const sendPaginatedListResponse = require('rheactor-server/api/pagination').sendPaginatedListResponse
const _merge = require('lodash/merge')
const _reduce = require('lodash/reduce')

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
        let query = _merge(
          {},
          {
            user: req.user
          },
          req.body,
          req.query
        )

        let v = Joi.validate(query, schema)
        if (v.error) {
          throw new ValidationFailedError('Validation failed', query, v.error)
        }

        let pagination = new Pagination(query.offset)
        return search.searchCheckingAccounts(query, pagination)
          .then(sendPaginatedListResponse.bind(null, new URIValue(config.get('api_host')), req, res, CheckingAccount.$context, jsonld, (checkingAccount) => {
            return transformer(checkingAccount)
          }))
      })
      .catch(sendHttpProblem.bind(null, res))
  })

  /**
   * Create a checking account
   */
  app.post('/api/checking-account', tokenAuth, function (req, res) {
    let schema = Joi.object().keys({
      name: Joi.string().min(1).required().trim()
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
        checkingAccountUserRepo.findByCheckingAccountId(req.params.id).filter(checkingAccountUser => checkingAccountUser.user === req.user),
        spendingRepo.findByCheckingAccountId(req.params.id).filter(spending => spending.booked)
      )
      .spread((checkingAccount, checkingAccountUser, spendings) => {
        if (!checkingAccountUser) {
          throw new AccessDeniedError(req.url, 'Not your checking account!')
        }
        const extra =
          _reduce(spendings, (extra, spending) => {
            extra.balance += spending.amount
            if (spending.amount >= 0) extra.income += spending.amount
            else extra.spendings += spending.amount
            return extra
          }, {
            balance: 0,
            income: 0,
            spendings: 0
          })
        return res.send(transformer(checkingAccount, extra))
      })
      .catch(sendHttpProblem.bind(null, res))
  })
}
