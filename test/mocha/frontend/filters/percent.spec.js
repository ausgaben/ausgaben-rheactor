'use strict'

/* global describe, it */

const percent = require('../../../../frontend/js/filters/percent')
const expect = require('chai').expect
const Promise = require('bluebird')

describe('percent filter', () => {
  it('should format floats', () => Promise
    .map([
      [0.12, '12%'],
      [-0.12, '-12%']
    ], pair => expect(percent(pair[0])).to.equal(pair[1]))
  )
})
