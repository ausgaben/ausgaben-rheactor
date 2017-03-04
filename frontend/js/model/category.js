import {URIValue} from 'rheactor-value-objects'

const $context = new URIValue('https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Category')

export class Category {
  /**
   * @param {string} title
   */
  constructor (title) {
    this.title = title
  }

  static get $context () {
    return $context
  }
}
