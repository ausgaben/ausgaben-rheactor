'use strict'

const ModelTransformer = require('rheactor-server/api/transformer')
const util = require('util')
const CheckingAccount = require('../../frontend/js/model/checking-account')
const Spending = require('../../frontend/js/model/spending')

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
        type: model.type.toString(),
        category: model.category,
        title: model.title,
        amount: model.amount,
        booked: model.booked,
        bookedAt: model.bookedAt ? new Date(model.bookedAt) : undefined
      })
  }
}

module.exports = AusgabenModelTransformer
