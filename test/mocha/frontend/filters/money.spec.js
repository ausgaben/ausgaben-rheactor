/* global describe, it */

import money from '../../../../frontend/js/filters/money'

import {expect} from 'chai'
import Promise from 'bluebird'

describe('money filter', () => {
  it('should format floats', done => {
    Promise
      .map([
        [1234, '12,34 €'],
        [-1234, '-12,34 €'],
        [1200, '12,00 €'],
        [123456789, '1.234.567,89 €'],
        [-123456789, '-1.234.567,89 €'],
        [0, '0,00 €']
      ], pair => {
        expect(money(pair[0])).to.equal(pair[1])
      })
      .then(() => done())
  })
})
