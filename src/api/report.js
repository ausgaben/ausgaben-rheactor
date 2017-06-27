import {ValidationFailedError, AccessDeniedError} from '@rheactorjs/errors'
import Promise from 'bluebird'
import _merge from 'lodash/merge'
import _reduce from 'lodash/reduce'
import Joi from 'joi'

function ReportModel (checkingAccount) {
  this.checkingAccount = checkingAccount
  this.balance = 0
  this.income = 0
  this.spendings = 0
  this.savings = 0
}

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
export default (
  app,
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
  transformer
) => {
  app.post('/api/checking-account/:id/report', tokenAuth, (req, res) => Promise
    .try(() => {
      const schema = Joi.object().keys({
        dateFrom: Joi.date(),
        dateTo: Joi.date(),
        checkingAccount: Joi.number().min(1).required()
      })

      const query = _merge({}, req.body, req.query)
      query.checkingAccount = req.params.id

      const v = Joi.validate(query, schema)
      if (v.error) {
        throw new ValidationFailedError('Validation failed', query, v.error)
      }
      return Promise
        .join(
          checkingAccountRepo.getById(req.params.id),
          checkingAccountUserRepo.findByCheckingAccountId(req.params.id).filter(checkingAccountUser => checkingAccountUser.user === req.user)
        )
        .spread((checkingAccount, checkingAccountUser) => {
          if (!checkingAccountUser) {
            throw new AccessDeniedError(req.url, 'Not your checking account!')
          }
          return spendingRepo.findByCheckingAccountId(checkingAccount.aggregateId())
            .filter(spending => spending.booked)
            .filter(spending => v.value.dateFrom ? spending.bookedAt >= v.value.dateFrom : true)
            .filter(spending => v.value.dateTo ? spending.bookedAt <= v.value.dateTo : true)
            .then(spendings => _reduce(
              spendings, (report, spending) => {
                report.balance += spending.amount
                if (spending.amount >= 0) {
                  report.income += spending.amount
                } else {
                  if (spending.saving) {
                    report.savings += spending.amount
                  } else {
                    report.spendings += spending.amount
                  }
                }
                return report
              }, new ReportModel(checkingAccount.aggregateId()))
            )
            .then(summary => res.send(transformer(summary)))
        })
    })
    .catch(sendHttpProblem.bind(null, res))
  )
}
