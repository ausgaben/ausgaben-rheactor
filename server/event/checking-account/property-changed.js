'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {ModelEvent} modelEvent
 * @constructor
 */
function CheckingAccountPropertyChangedEvent (modelEvent) {
  ModelEvent.call(this, modelEvent.aggregateId, this.constructor.name, modelEvent.data, modelEvent.createdAt)
}
util.inherits(CheckingAccountPropertyChangedEvent, ModelEvent)

module.exports = CheckingAccountPropertyChangedEvent
