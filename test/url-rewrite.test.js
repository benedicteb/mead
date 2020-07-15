const request = require('supertest')
const {app, assertImageMeta} = require('./helpers')

jest.setTimeout(15000)

const bar = {
  name: 'bar-remover',
  type: 'url-rewriter',
  handler: url => url.replace(/^\/?bar/, ''),
}

const baz = {
  name: 'baz-remover',
  type: 'url-rewriter',
  handler: url => url.replace(/^\/?baz/, ''),
}

test('[url-rewrite] can rewrite urls with plugins', done => {
  app({plugins: [bar, baz]}, (err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/bar/baz/images/320x180.png')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        assertImageMeta(res, {width: 320, height: 180}, done)
      })
  })
})
