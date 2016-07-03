'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {ModelEvent} modelEvent
 * @constructor
 */
function PeriodicalCreatedEvent (modelEvent) {
  ModelEvent.call(this, modelEvent.aggregateId, this.constructor.name, modelEvent.data, modelEvent.createdAt)
}
util.inherits(PeriodicalCreatedEvent, ModelEvent)

module.exports = PeriodicalCreatedEvent
