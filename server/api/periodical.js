'use strict'

const Errors = require('rheactor-value-objects/errors')
const Periodical = require('../../frontend/js/model/periodical')
const CreatePeriodicalCommand = require('../command/periodical/create')
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
 * @param {PeriodicalRepository} periodicalRepo
 * @param {UserRepository} userRepo
 * @param {Search} search
 * @param tokenAuth
 * @param {JSONLD} jsonld
 * @param {function} sendHttpProblem
 * @param {function} transformer
 */
module.exports = function (app, config, emitter, checkingAccountRepo, checkingAccountUserRepo, periodicalRepo, userRepo, search, tokenAuth, jsonld, sendHttpProblem, transformer) {
  /**
   * Search periodicals in the given checking account
   */
  app.post('/api/checking-account/:id/search/periodical', tokenAuth, function (req, res) {
    return checkingAccountUserRepo.findByCheckingAccountId(req.params.id)
      .then((checkingAccountUser) => {
        if (!checkingAccountUser && checkingAccountUser.user !== req.user) {
          throw new Errors.AccessDeniedError(req.url, 'Not your checking account!')
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
              throw new Errors.ValidationFailedException('Validation failed', query, v.error)
            }

            let pagination = new Pagination(query.offset)
            return search.searchPeriodicals(query, pagination)
              .then(sendPaginatedListResponse.bind(null, new URIValue(config.get('api_host')), req, res, Periodical.$context, jsonld, (periodical) => {
                return transformer(periodical)
              }))
          })
      })
      .catch(sendHttpProblem.bind(null, res))
  })

  /**
   * Create a periodical in the given checking account
   */
  app.post('/api/checking-account/:id/periodical', tokenAuth, function (req, res) {
    let schema = Joi.object().keys({
      type: Joi.string().min(1).required().trim(),
      category: Joi.string().min(1).required().trim(),
      title: Joi.string().min(1).required().trim(),
      amount: Joi.number().integer().required(),
      estimate: Joi.boolean().default(false),
      startsAt: Joi.date(),
      enabledIn01: Joi.boolean().default(false),
      enabledIn02: Joi.boolean().default(false),
      enabledIn03: Joi.boolean().default(false),
      enabledIn04: Joi.boolean().default(false),
      enabledIn05: Joi.boolean().default(false),
      enabledIn06: Joi.boolean().default(false),
      enabledIn07: Joi.boolean().default(false),
      enabledIn08: Joi.boolean().default(false),
      enabledIn09: Joi.boolean().default(false),
      enabledIn10: Joi.boolean().default(false),
      enabledIn11: Joi.boolean().default(false),
      enabledIn12: Joi.boolean().default(false)
    })
    Promise
      .try(() => {
        let v = Joi.validate(req.body, schema)
        if (v.error) {
          console.error(v.error)
          throw new Errors.ValidationFailedException('Validation failed', req.body, v.error)
        }
        return Promise
          .join(
            checkingAccountRepo.getById(req.params.id),
            checkingAccountUserRepo.findByCheckingAccountId(req.params.id),
            userRepo.getById(req.user)
          )
          .spread((checkingAccount, checkingAccountUser, user) => {
            if (!checkingAccountUser && checkingAccountUser.user !== req.user) {
              throw new Errors.AccessDeniedError(req.url, 'Not your checking account!')
            }
            let cmd = new CreatePeriodicalCommand(
              checkingAccount,
              new SpendingTypeValue(v.value.type),
              v.value.category,
              v.value.title,
              v.value.amount,
              v.value.estimate,
              v.value.startsAt ? new Date(v.value.startsAt).getTime() : undefined,
              v.value.enabledIn01,
              v.value.enabledIn02,
              v.value.enabledIn03,
              v.value.enabledIn04,
              v.value.enabledIn05,
              v.value.enabledIn06,
              v.value.enabledIn07,
              v.value.enabledIn08,
              v.value.enabledIn09,
              v.value.enabledIn10,
              v.value.enabledIn11,
              v.value.enabledIn12,
              user
            )
            return emitter.emit(cmd)
          })
          .then(
            /**
             * @param {PeriodicalCreatedEvent} event
             * @returns {*}
             */
            (event) => {
              return res
                .header('Location', jsonld.createId(Periodical.$context, event.aggregateId))
                .status(201)
                .send()
            })
      })
      .catch(sendHttpProblem.bind(null, res))
  })

  app.get('/api/periodical/:id', tokenAuth, function (req, res) {
    periodicalRepo.getById(req.params.id)
      .then((periodical) => {
        return checkingAccountUserRepo.findByCheckingAccountId(periodical.checkingAccount)
          .then((checkingAccountUser) => {
            if (!checkingAccountUser && checkingAccountUser.user !== req.user) {
              throw new Errors.AccessDeniedError(req.url, 'Not your checking account!')
            }
            return res.send(transformer(periodical))
          })
      })
      .catch(sendHttpProblem.bind(null, res))
  })
}
