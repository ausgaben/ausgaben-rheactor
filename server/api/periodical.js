import {ValidationFailedError, AccessDeniedError} from '@resourcefulhumans/rheactor-errors'
import Periodical from '../../frontend/js/model/periodical'
import CreatePeriodicalCommand from '../command/periodical/create'
import {URIValue} from 'rheactor-value-objects'
import Promise from 'bluebird'
import Joi from 'joi'
import {Pagination, sendPaginatedListResponse} from 'rheactor-server'
import _merge from 'lodash/merge'

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
export default (
  app,
  config,
  emitter,
  checkingAccountRepo,
  checkingAccountUserRepo,
  periodicalRepo,
  userRepo,
  search,
  tokenAuth,
  jsonld,
  sendHttpProblem,
  transformer
) => {
  /**
   * Search periodicals in the given checking account
   */
  app.post('/api/checking-account/:id/search/periodical', tokenAuth, (req, res) => checkingAccountUserRepo.findByCheckingAccountId(req.params.id).filter(checkingAccountUser => checkingAccountUser.user === req.user)
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
          return search.searchPeriodicals(query, pagination)
            .then(sendPaginatedListResponse.bind(null, new URIValue(config.get('api_host')), req, res, Periodical.$context, jsonld, (periodical) => {
              return transformer(periodical)
            }))
        })
    })
    .catch(sendHttpProblem.bind(null, res)))

  /**
   * Create a periodical in the given checking account
   */
  app.post('/api/checking-account/:id/periodical', tokenAuth, (req, res) => {
    let schema = Joi.object().keys({
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
      enabledIn12: Joi.boolean().default(false),
      saving: Joi.boolean().default(false)
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
            let cmd = new CreatePeriodicalCommand(
              checkingAccount,
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
              v.value.saving,
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

  app.get('/api/periodical/:id', tokenAuth, (req, res) => {
    periodicalRepo.getById(req.params.id)
      .then((periodical) => {
        return checkingAccountUserRepo.findByCheckingAccountId(periodical.checkingAccount).filter(checkingAccountUser => checkingAccountUser.user === req.user)
          .then((checkingAccountUser) => {
            if (!checkingAccountUser) {
              throw new AccessDeniedError(req.url, 'Not your checking account!')
            }
            return res.send(transformer(periodical))
          })
      })
      .catch(sendHttpProblem.bind(null, res))
  })
}
