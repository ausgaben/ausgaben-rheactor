'use strict'

module.exports = (value) => {
  if (!value) return
  return (+value / 100) + ' €'
}
