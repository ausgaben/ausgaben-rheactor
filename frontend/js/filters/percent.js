'use strict'

/**
 * format the number as percent
 *
 * @param {number} value The number to format
 * @return {string}
 */
const percentFormat = (value) => {
  return Math.round(value) + '%'
}

module.exports = (value) => {
  if (!value) return
  return percentFormat(value * 100)
}
