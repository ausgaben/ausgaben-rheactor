'use strict'

const ModelTransformer = require('rheactor-server/api/transformer')
const util = require('util')
const CheckingAccount = require('../../frontend/js/model/checking-account')

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
  }
}

module.exports = AusgabenModelTransformer
