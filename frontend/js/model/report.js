import {Aggregate} from 'rheactor-models'
import _forEach from 'lodash/forEach'
import _create from 'lodash/create'

/**
 * @param {object} data
 * @constructor
 */
function Report (data) {
  this.balance = undefined
  this.income = undefined
  this.spendings = undefined
  this.savings = undefined
  this.checkingAccount = undefined

  if (data) {
    const self = this
    _forEach(this, (value, key) => {
      self[key] = data[key] === undefined ? undefined : data[key]
    })
  }
  this.$context = Report.$context
}
Report.prototype = _create(Aggregate.prototype, {
  'constructor': Report
})

Report.$context = 'https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Report'

export default Report
