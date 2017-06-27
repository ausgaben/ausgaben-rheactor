import {URIValue} from '@rheactorjs/value-objects'
import {Reference, ReferenceType, ReferenceJSONType, Model} from '@rheactorjs/models'
import {struct, irreducible, Integer as IntegerType} from 'tcomb'

const $context = new URIValue('https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Report')

export class Report extends Model {
  constructor (fields) {
    super({$context})
    const {balance, income, spendings, savings, checkingAccount} = fields
    this.balance = IntegerType(balance, ['Report', 'amount:Integer'])
    this.income = IntegerType(income, ['Report', 'amount:Integer'])
    this.spendings = IntegerType(spendings, ['Report', 'amount:Integer'])
    this.savings = IntegerType(savings, ['Report', 'amount:Integer'])
    this.checkingAccount = ReferenceType(checkingAccount, ['Report', 'checkingAccount:ReferenceValue'])
  }

  static get $context () {
    return $context
  }

  toJSON () {
    return Object.assign(super.toJSON(), {
      $context: $context.toString(),
      balance: this.balance,
      income: this.income,
      spendings: this.spendings,
      savings: this.savings,
      checkingAccount: this.checkingAccount.toJSON()
    })
  }

  static fromJSON (data) {
    ReportJSONType(data)
    return new Report(super.fromJSON(data), {
      balance: data.balance,
      income: data.income,
      spendings: data.spendings,
      savings: data.savings,
      checkingAccount: Reference.fromJSON(data.checkingAccount)
    })
  }

  /**
   * Returns true if x is of type Report
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (x instanceof Report) || ('$context' in x && URIValue.is(x.$context) && $context.equals(x.$context))
  }
}

export const ReportJSONType = struct({
  balance: IntegerType,
  income: IntegerType,
  spendings: IntegerType,
  savings: IntegerType,
  checkingAccount: ReferenceJSONType
}, 'ReportJSONType')
export const ReportType = irreducible('ReportType', Report.is)
