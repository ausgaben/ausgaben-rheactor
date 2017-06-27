import {URIValue} from '@rheactorjs/value-objects'
import {String as StringType, refinement, struct, irreducible} from 'tcomb'
import {Model} from '@rheactorjs/models'
const $context = new URIValue('https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Category')
const NonEmptyStringType = refinement(StringType, s => s.length > 0, 'NonEmptyStringType')

export class Category extends Model {
  /**
   * @param {string} title
   */
  constructor (title) {
    super({$context})
    this.title = NonEmptyStringType(title, ['Category', 'title:String'])
  }

  toJSON () {
    return Object.assign(
      super.toJSON(),
      {
        title: this.title
      }
    )
  }

  static fromJSON (data) {
    CategoryJSONType(data)
    return new Category(Object.assign(
      super.fromJSON(data), {
        title: data.title
      })
    )
  }

  static get $context () {
    return $context
  }

  /**
   * Returns true if x is of type Category
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (x instanceof Category) || ('$context' in x && URIValue.is(x.$context) && $context.equals(x.$context))
  }
}

export const CategoryJSONType = struct({
  title: NonEmptyStringType
}, 'CategoryJSONType')
export const CategoryType = irreducible('CategoryType', Category.is)
