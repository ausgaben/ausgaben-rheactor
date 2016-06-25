'use strict'

const Errors = require('rheactor-value-objects/errors')
const CheckingAccount = require('../../frontend/js/model/checking-account')
const CreateCheckingAccountCommand = require('../command/checking-account/create')
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
   * Search checkingAccounts
   */
  app.post('/api/search/checking-account', tokenAuth, function (req, res) {
    let schema = Joi.object().keys({
      user: Joi.number().min(1),
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
          throw new Errors.ValidationFailedException('Validation failed', query, v.error)
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
    userRepo.getById(req.user)
      .then((user) => {
        let cmd = new CreateCheckingAccountCommand(
          req.body.name,
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
      .catch(sendHttpProblem.bind(null, res))
  })

  app.get('/api/checking-account/:id', tokenAuth, function (req, res) {
    return Promise
      .join(
        checkingAccountRepo.getById(req.params.id),
        checkingAccountUserRepo.findByCheckingAccountId(req.params.id)
      )
      .spread((checkingAccount, checkingAccountUser) => {
        if (!checkingAccountUser) {
          throw new Errors.AccessDeniedError(req.url, 'Not your checking account!')
        }
        return res.send(transformer(checkingAccount))
      })
      .catch(sendHttpProblem.bind(null, res))
  })
}
