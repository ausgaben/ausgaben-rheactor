import {ValidationFailedError, AccessDeniedError} from '@rheactorjs/errors'
import {Periodical} from '@ausgaben/models'
import CreatePeriodicalCommand from '../command/periodical/create'
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
            .then(sendPaginatedListResponse.bind(null, new URIValue(config.get('api_host')), req, res, periodical => transformer(periodical)))
        })
    })
    .catch(sendHttpProblem.bind(null, res)))

  /**
   * Create a periodical in the given checking account
   */
  app.post('/api/checking-account/:id/periodical', tokenAuth, (req, res) => {
    const b = Joi.boolean().falsy([0, '0']).truthy([1, '1']).default(false)
    let schema = Joi.object().keys({
      category: Joi.string().min(1).required().trim(),
      title: Joi.string().min(1).required().trim(),
      amount: Joi.number().integer().required(),
      estimate: b,
      startsAt: Joi.date(),
      enabledIn01: b,
      enabledIn02: b,
      enabledIn03: b,
      enabledIn04: b,
      enabledIn05: b,
      enabledIn06: b,
      enabledIn07: b,
      enabledIn08: b,
      enabledIn09: b,
      enabledIn10: b,
      enabledIn11: b,
      enabledIn12: b,
      saving: b
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
              v.value.startsAt ? new Date(v.value.startsAt) : undefined,
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
