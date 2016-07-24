'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {ModelEvent} modelEvent
 * @constructor
 */
function SpendingUpdatedEvent (modelEvent) {
  ModelEvent.call(this, modelEvent.aggregateId, this.constructor.name, modelEvent.data, modelEvent.createdAt)
}
util.inherits(SpendingUpdatedEvent, ModelEvent)

module.exports = SpendingUpdatedEvent
