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

const $context = new URIValue('https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Spending')

export class Spending extends Aggregate {
  constructor (fields) {
    super(Object.assign(fields, {$context}))
    const {category, title, amount, booked, saving, bookedAt} = fields
    this.category = NonEmptyStringType(category, ['Spending', 'category:String'])
    this.title = NonEmptyStringType(title, ['Spending', 'title:String'])
    this.amount = IntegerType(amount, ['Spending', 'amount:Integer'])
    this.booked = BooleanType(booked || false, ['Spending', 'booked:Boolean'])
    this.bookedAt = MaybeDateType(bookedAt, ['Spending', 'bookedAt:?Date'])
    this.saving = BooleanType(saving || false, ['Spending', 'saving:Boolean'])
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
        booked: this.booked,
        bookedAt: this.bookedAt ? this.bookedAt.toISOString() : undefined,
        saving: this.saving
      }
    )
  }

  static fromJSON (data) {
    SpendingJSONType(data)
    return new Spending(Object.assign(
      super.fromJSON(data), {
        category: data.category,
        title: data.title,
        amount: data.amount,
        booked: data.booked,
        bookedAt: data.bookedAt ? new Date(data.bookedAt) : undefined,
        saving: data.saving
      })
    )
  }

  /**
   * Returns true if x is of type Spending
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (x instanceof Spending) || (Aggregate.is(x) && '$context' in x && URIValue.is(x.$context) && $context.equals(x.$context))
  }
}

export const SpendingJSONType = struct({
  $id: StringType,
  $version: VersionNumberType,
  $deleted: MaybeBooleanType,
  $createdAt: StringType,
  $updatedAt: MaybeStringType,
  $deletedAt: MaybeStringType,
  category: NonEmptyStringType,
  title: NonEmptyStringType,
  booked: BooleanType,
  bookedAt: MaybeDateType,
  saving: BooleanType,
  amount: IntegerType
}, 'SpendingJSONType')
export const SpendingType = irreducible('SpendingType', Spending.is)
