import {Aggregate, VersionNumberType} from '@rheactorjs/models'
import {URIValue} from '@rheactorjs/value-objects'
import {
  Boolean as BooleanType,
  String as StringType,
  refinement,
  struct,
  maybe,
  irreducible,
  Date as DateType,
  Integer as IntegerType
} from 'tcomb'
const NonEmptyStringType = refinement(StringType, s => s.length > 0, 'NonEmptyStringType')
const MaybeBooleanType = maybe(BooleanType)
const MaybeStringType = maybe(StringType)
const MaybeDateType = maybe(DateType)

const $context = new URIValue('https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Periodical')

export class Periodical extends Aggregate {
  constructor (fields) {
    super(Object.assign(fields, {$context}))
    const {
      category, title, amount, saving, startsAt, estimate, enabledIn01,
      enabledIn02,
      enabledIn03,
      enabledIn04,
      enabledIn05,
      enabledIn06,
      enabledIn07,
      enabledIn08,
      enabledIn09,
      enabledIn10,
      enabledIn11,
      enabledIn12
    } = fields
    this.category = NonEmptyStringType(category, ['Periodical', 'category:String'])
    this.title = NonEmptyStringType(title, ['Periodical', 'title:String'])
    this.amount = IntegerType(amount, ['Periodical', 'amount:Integer'])
    this.saving = BooleanType(saving || false, ['Periodical', 'saving:Boolean'])
    this.estimate = BooleanType(estimate || false, ['Periodical', 'estimate:Boolean'])
    this.startsAt = MaybeDateType(startsAt, ['Spending', 'startsAt:?Date'])
    this.enabledIn01 = BooleanType(enabledIn01 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn02 = BooleanType(enabledIn02 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn03 = BooleanType(enabledIn03 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn04 = BooleanType(enabledIn04 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn05 = BooleanType(enabledIn05 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn06 = BooleanType(enabledIn06 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn07 = BooleanType(enabledIn07 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn08 = BooleanType(enabledIn08 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn09 = BooleanType(enabledIn09 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn10 = BooleanType(enabledIn10 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn11 = BooleanType(enabledIn11 || false, ['Periodical', 'enabledIn01:Boolean'])
    this.enabledIn12 = BooleanType(enabledIn12 || false, ['Periodical', 'enabledIn01:Boolean'])
  }

  static get $context () {
    return $context
  }

  toJSON () {
    return Object.assign(
      super.toJSON(),
      {
        category: this.category,
        title: this.title,
        amount: this.amount,
        saving: this.saving,
        estimate: this.estimate,
        startsAt: this.startsAt ? this.startsAt.toISOString() : undefined,
        enabledIn01: this.enabledIn01,
        enabledIn02: this.enabledIn02,
        enabledIn03: this.enabledIn03,
        enabledIn04: this.enabledIn04,
        enabledIn05: this.enabledIn05,
        enabledIn06: this.enabledIn06,
        enabledIn07: this.enabledIn07,
        enabledIn08: this.enabledIn08,
        enabledIn09: this.enabledIn09,
        enabledIn10: this.enabledIn10,
        enabledIn11: this.enabledIn11,
        enabledIn12: this.enabledIn12
      }
    )
  }

  static fromJSON (data) {
    PeriodicalJSONType(data)
    return new Periodical(Object.assign(
      super.fromJSON(data), {
        category: data.category,
        title: data.title,
        amount: data.amount,
        saving: data.saving,
        estimate: data.estimate,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        enabledIn01: data.enabledIn01,
        enabledIn02: data.enabledIn02,
        enabledIn03: data.enabledIn03,
        enabledIn04: data.enabledIn04,
        enabledIn05: data.enabledIn05,
        enabledIn06: data.enabledIn06,
        enabledIn07: data.enabledIn07,
        enabledIn08: data.enabledIn08,
        enabledIn09: data.enabledIn09,
        enabledIn10: data.enabledIn10,
        enabledIn11: data.enabledIn11,
        enabledIn12: data.enabledIn12
      })
    )
  }

  /**
   * Returns true if x is of type Periodical
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (x instanceof Periodical) || (Aggregate.is(x) && '$context' in x && URIValue.is(x.$context) && $context.equals(x.$context))
  }
}

export const PeriodicalJSONType = struct({
  $id: StringType,
  $version: VersionNumberType,
  $deleted: MaybeBooleanType,
  $createdAt: StringType,
  $updatedAt: MaybeStringType,
  $deletedAt: MaybeStringType,
  category: NonEmptyStringType,
  title: NonEmptyStringType,
  saving: BooleanType,
  amount: IntegerType,
  startsAt: MaybeDateType,
  estimate: BooleanType,
  enabledIn01: BooleanType,
  enabledIn02: BooleanType,
  enabledIn03: BooleanType,
  enabledIn04: BooleanType,
  enabledIn05: BooleanType,
  enabledIn06: BooleanType,
  enabledIn07: BooleanType,
  enabledIn08: BooleanType,
  enabledIn09: BooleanType,
  enabledIn10: BooleanType,
  enabledIn11: BooleanType,
  enabledIn12: BooleanType
}, 'PeriodicalJSONType')
export const PeriodicalType = irreducible('PeriodicalType', Periodical.is)
