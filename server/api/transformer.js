'use strict'

const ModelTransformer = require('rheactor-server/api/transformer')
const util = require('util')
const CheckingAccount = require('../../frontend/js/model/checking-account')
const Spending = require('../../frontend/js/model/spending')
const Periodical = require('../../frontend/js/model/periodical')
const Report = require('../../frontend/js/model/report')
const PeriodicalModel = require('../model/periodical')

/**
 * @constructor
 */
const AusgabenModelTransformer = function () {
  ModelTransformer.call(this)
}
util.inherits(AusgabenModelTransformer, ModelTransformer)

/**
 * @param {JSONLD} jsonld
 * @param {AggregateRoot} model
 * @param {object} extra
 */
AusgabenModelTransformer.prototype.transform = function (jsonld, model, extra) {
  extra = extra || {}
  switch (model.constructor.name) {
    case 'UserModel':
      return ModelTransformer.prototype.transform.call(this, jsonld, model)
    case 'CheckingAccountModel':
      return new CheckingAccount({
        $id: jsonld.createId(CheckingAccount.$context, model.aggregateId()),
        $version: model.aggregateVersion(),
        $links: jsonld.createLinks(CheckingAccount.$context, model.aggregateId()),
        $createdAt: model.createdAt(),
        $updatedAt: model.updatedAt(),
        $deletedAt: model.deletedAt(),
        identifier: model.aggregateId(),
        name: model.name
      })
    case 'SpendingModel':
      return new Spending({
        $id: jsonld.createId(Spending.$context, model.aggregateId()),
        $version: model.aggregateVersion(),
        $links: jsonld.createLinks(Spending.$context, model.aggregateId()),
        $createdAt: model.createdAt(),
        $updatedAt: model.updatedAt(),
        $deletedAt: model.deletedAt(),
        category: model.category,
        title: model.title,
        amount: model.amount,
        booked: model.booked,
        bookedAt: model.bookedAt ? new Date(model.bookedAt) : undefined,
        saving: model.saving
      })
    case PeriodicalModel.name:
      return new Periodical({
        $id: jsonld.createId(Spending.$context, model.aggregateId()),
        $version: model.aggregateVersion(),
        $links: jsonld.createLinks(Spending.$context, model.aggregateId()),
        $createdAt: model.createdAt(),
        $updatedAt: model.updatedAt(),
        $deletedAt: model.deletedAt(),
        category: model.category,
        title: model.title,
        amount: model.amount,
        estimate: model.estimate,
        startsAt: model.startsAt ? new Date(model.startsAt) : undefined,
        enabledIn01: !!(model.enabledIn & PeriodicalModel.monthFlags[0]),
        enabledIn02: !!(model.enabledIn & PeriodicalModel.monthFlags[1]),
        enabledIn03: !!(model.enabledIn & PeriodicalModel.monthFlags[2]),
        enabledIn04: !!(model.enabledIn & PeriodicalModel.monthFlags[3]),
        enabledIn05: !!(model.enabledIn & PeriodicalModel.monthFlags[4]),
        enabledIn06: !!(model.enabledIn & PeriodicalModel.monthFlags[5]),
        enabledIn07: !!(model.enabledIn & PeriodicalModel.monthFlags[6]),
        enabledIn08: !!(model.enabledIn & PeriodicalModel.monthFlags[7]),
        enabledIn09: !!(model.enabledIn & PeriodicalModel.monthFlags[8]),
        enabledIn10: !!(model.enabledIn & PeriodicalModel.monthFlags[9]),
        enabledIn11: !!(model.enabledIn & PeriodicalModel.monthFlags[10]),
        enabledIn12: !!(model.enabledIn & PeriodicalModel.monthFlags[11]),
        saving: model.saving
      })
    case 'ReportModel':
      return new Report({
        balance: model.balance,
        income: model.income,
        spendings: model.spendings,
        checkingAccount: {
          $context: CheckingAccount.$context,
          $id: jsonld.createId(CheckingAccount.$context, model.checkingAccount)
        }
      })
  }
}
module.exports = AusgabenModelTransformer
