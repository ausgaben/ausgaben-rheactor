'use strict'

let Joi = require('joi')
let ValidationFailedException = require('rheactor-value-objects/errors').ValidationFailedException

/**
 * @param {String} type
 * @constructor
 * @throws ValidationFailedException if the creation fails due to invalid data
 */
function SpendingTypeValue (type) {
  let schema = Joi.object().keys({
    type: Joi.string().trim().required().only(allowedTypes)
  })
  Joi.validate({type}, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedException('Not a type: ' + type, data, err)
    }
    this.type = data.type
  })
}

SpendingTypeValue.prototype.toString = function () {
  return this.type
}
SpendingTypeValue.INCOME = 'income'
SpendingTypeValue.SPENDING = 'spending'
SpendingTypeValue.SAVING = 'saving'

let allowedTypes = [SpendingTypeValue.INCOME, SpendingTypeValue.SPENDING, SpendingTypeValue.SAVING]

SpendingTypeValue.types = allowedTypes

module.exports = SpendingTypeValue
