'use strict'

/**
 * @param {string} title
 * @param {string} category
 * @constructor
 */
function Title (title, category) {
  this.title = title
  this.category = category
  this.$context = Title.$context
}
Title.$context = 'https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Title'

module.exports = Title
