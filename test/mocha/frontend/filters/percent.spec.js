/* global describe, it */

import percent from '../../../../frontend/js/filters/percent'

import {expect} from 'chai'
import Promise from 'bluebird'

describe('percent filter', () => {
  it('should format floats', () => Promise
    .map([
      [0.12, '12%'],
      [-0.12, '-12%']
    ], pair => expect(percent(pair[0])).to.equal(pair[1]))
  )
})
