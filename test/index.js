import Metalsmith from 'metalsmith'
import assert from 'assert'
import {
  interpolate,
  resolvers
} from '../lib'
import debug from 'debug'
let dbg = debug('tests')
dbg('interpolate', interpolate)

describe('metalsmith-interpolate', () => {
  it('should be able to interpolate meta tokens', (done) => {
    Metalsmith('test/fixtures')
    .use((files, metalsmith, done) => {
      let result = interpolate('{title}', 'one.html', files)
      assert.ok(result === 'page one title')
      done()
    })
    .build((err, files) => {
      if (err) return done(err)
      done()
    })
  })
  it('should be able to interpolate path tokens', (done) => {
    Metalsmith('test/fixtures')
    .use((files, metalsmith, done) => {
      let result = interpolate('{ext}', 'one.html', files)
      assert.ok(result === '.html')
      done()
    })
    .build((err, files) => {
      if (err) return done(err)
      done()
    })
  })
  it('should be able to interpolate date tokens', (done) => {
    Metalsmith('test/fixtures')
    .use((files, metalsmith, done) => {
      let result = interpolate('{YYYY}', 'one.html', files)
      assert.ok(result === '2016')
      done()
    })
    .build((err, files) => {
      if (err) return done(err)
      done()
    })
  })
  it('should be able to slugify tokens', (done) => {
    Metalsmith('test/fixtures')
    .use((files, metalsmith, done) => {
      let result = interpolate('{-title}', 'one.html', files)
      assert.ok(result === 'page-one-title')
      done()
    })
    .build((err, files) => {
      if (err) return done(err)
      done()
    })
  })
  it('should allow custom resolvers', (done) => {
    resolvers.unshift((token, meta) => {
      if (token === 'custom') return 'ok'
    })
    Metalsmith('test/fixtures')
    .use((files, metalsmith, done) => {
      let result = interpolate('{custom}', 'one.html', files)
      assert.ok(result === 'ok')
      done()
    })
    .build((err, files) => {
      if (err) return done(err)
      done()
    })
  })
  it('should work without src & files arguments', (done) => {
    Metalsmith('test/fixtures')
    .use((files, metalsmith, done) => {
      let result = interpolate('{custom}', {custom: 'ok'})
      assert.ok(result === 'ok')
      done()
    })
    .build((err, files) => {
      if (err) return done(err)
      done()
    })
  })
})
