'use strict'

/**
 * @param {string} title
 * @constructor
 */
function Category (title) {
  this.title = title
  this.$context = Category.$context
}
Category.$context = 'https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Category'

module.exports = Category
