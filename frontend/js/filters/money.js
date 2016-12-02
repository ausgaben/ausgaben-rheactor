'use strict'

/**
 * format the decimal value as a currency e.g. 12.345.678,00 €
 *
 * Options:
 * symbol: The currency symbol to add to the returned string
 * delimiter: Two character string, first character is the thousands separator, second character is the decimal point
 * placement: Should the symbol be placed "before" or "after" the number
 * decimal: Return in decimal notation
 *
 * @param {number} value The number to format
 * @param {object} opts
 * @return {string}
 */
const moneyFormat = (value, opts) => {
  const symbol = opts.symbol || ' €'
  const delimiter = opts.delimiter || '.,'
  const decimal = !!opts.decimal
  const placeBefore = (opts.placement || 'after') === 'before'
  if (isNaN(value) || value === null || value === '') {
    return '—'
  }
  let result = (+value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1' + delimiter.charAt(0)).replace(/\.(\d+)$/, delimiter.charAt(1) + '$1')
  result = decimal ? result : result.substr(0, result.length - 3)
  return placeBefore ? symbol + result : result + symbol
}

module.exports = (value) => {
  return moneyFormat(value / 100, {decimal: true})
}
