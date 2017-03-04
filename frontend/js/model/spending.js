import {Aggregate} from 'rheactor-models'
import _forEach from 'lodash/forEach'
import _create from 'lodash/create'

/**
 * @param {object} data
 * @constructor
 */
function Spending (data) {
  this.$id = undefined
  this.$version = undefined
  this.$links = undefined
  this.$createdAt = undefined
  this.$updatedAt = undefined
  this.$deletedAt = undefined
  this.category = undefined
  this.title = undefined
  this.amount = undefined
  this.booked = undefined
  this.bookedAt = undefined
  this.saving = undefined

  if (data) {
    const self = this
    _forEach(this, (value, key) => {
      self[key] = data[key] === undefined ? undefined : data[key]
    })
  }
  this.$context = Spending.$context
  this.$acceptedEvents = []
  this.$aggregateAlias = 'spending'
  if (this.bookedAt) this.bookedAt = new Date(this.bookedAt)
  this.booked = !!this.booked
  this.saving = !!this.saving
  this.amount = +this.amount
}
Spending.prototype = _create(Aggregate.prototype, {
  'constructor': Spending
})

Spending.$context = 'https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Spending'

export default Spending
