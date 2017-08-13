import {ValidationFailedError, AccessDeniedError} from '@rheactorjs/errors'
import {Spending} from '@ausgaben/models'
import CreateSpendingCommand from '../command/spending/create'
import UpdateSpendingCommand from '../command/spending/update'
import DeleteSpendingCommand from '../command/spending/delete'
import {URIValue} from '@rheactorjs/value-objects'
import Promise from 'bluebird'
import Joi from 'joi'
import {checkVersionImmutable, sendPaginatedListResponse, Pagination} from '@rheactorjs/server'
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
   * Search spendings in the given checking account
   */
  app.post('/api/checking-account/:id/search/spending', tokenAuth, (req, res) => Promise
    .try(() => {
      const schema = Joi.object().keys({
        dateFrom: Joi.date(),
        dateTo: Joi.date(),
        checkingAccount: Joi.number().min(1),
        offset: Joi.number().min(0)
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
          return search.searchSpendings(query, pagination)
            .then(sendPaginatedListResponse.bind(null, new URIValue(config.get('api_host')), req, res, spending => transformer(spending)))
        })
    })
    .catch(sendHttpProblem.bind(null, res))
  )

  /**
   * Create a spending in the given checking account
   */
  app.post('/api/checking-account/:id/spending', tokenAuth, (req, res) => {
    const b = Joi.boolean().falsy([0, '0']).truthy([1, '1'])
    let schema = Joi.object().keys({
      category: Joi.string().min(1).required().trim(),
      title: Joi.string().min(1).required().trim(),
      amount: Joi.number().integer().required(),
      booked: b.required(),
      bookedAt: Joi.date(),
      saving: b.default(false),
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
              v.value.bookedAt ? new Date(v.value.bookedAt) : undefined,
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

  app.get('/api/spending/:id', tokenAuth, (req, res) => {
    spendingRepo.getById(req.params.id)
      .then(spending => checkingAccountUserRepo.findByCheckingAccountId(spending.checkingAccount).filter(checkingAccountUser => checkingAccountUser.user === req.user)
        .then((checkingAccountUser) => {
          if (!checkingAccountUser) {
            throw new AccessDeniedError(req.url, 'Not your checking account!')
          }
        })
        .then(() => res.send(transformer(spending)))
      )
      .catch(sendHttpProblem.bind(null, res))
  })

  /**
   * Update a spending
   */
  app.put('/api/spending/:id', tokenAuth, (req, res) => {
    const b = Joi.boolean().falsy([0, '0']).truthy([1, '1'])
    let schema = Joi.object().keys({
      category: Joi.string().min(1).trim(),
      title: Joi.string().min(1).trim(),
      amount: Joi.number().integer(),
      booked: b,
      bookedAt: Joi.date(),
      saving: b,
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
            checkVersionImmutable(req.headers['if-match'], spending)
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
                v.value.bookedAt ? new Date(v.value.bookedAt) : undefined,
                v.value.saving,
                user
              )
              emitter.emit(cmd)
            })
          )
      })
      .then(() => res.status(202).send())
      .catch(sendHttpProblem.bind(null, res))
  })

  /**
   * Delete a spending
   */
  app.delete('/api/spending/:id', tokenAuth, (req, res) => spendingRepo.getById(req.params.id)
    .then(spending => {
      checkVersionImmutable(req.headers['if-match'], spending)
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
        let cmd = new DeleteSpendingCommand(spending, user)
        emitter.emit(cmd)
      })
    )
    .then(() => res.status(202).send())
    .catch(sendHttpProblem.bind(null, res))
  )
}
