'use strict'

const ModelTransformer = require('rheactor-server/api/transformer')
const util = require('util')

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
  }
}

module.exports = AusgabenModelTransformer
