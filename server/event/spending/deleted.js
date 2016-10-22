'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {ModelEvent} modelEvent
 * @constructor
 */
function SpendingDeletedEvent (modelEvent) {
  ModelEvent.call(this, modelEvent.aggregateId, this.constructor.name, modelEvent.data, modelEvent.deletedAt, modelEvent.createdBy)
}
util.inherits(SpendingDeletedEvent, ModelEvent)

module.exports = SpendingDeletedEvent
