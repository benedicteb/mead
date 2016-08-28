const needle = require('needle')
const Boom = require('boom')
const urlIsPrivate = require('url-is-private')
const parallel = require('async.parallel')

const defaultConfig = {
  allowPrivateHosts: false
}

function proxySource(conf) {
  const config = Object.assign({}, defaultConfig, conf)

  if (!config.secureUrlToken) {
    throw Boom.badImplementation('Proxy sources require a `secureUrlToken` configuration parameter')
  }

  return {
    getImageStream: getImageStreamer(config),
    requiresSignedUrls: true
  }
}

function getImageStreamer(config) {
  return (...args) => getImageStream(config, ...args)
}

function getImageStream(config, url, callback) {
  if (!/^https?:\/\//i.test(url)) {
    setImmediate(callback, Boom.badRequest('Only http/https URLs are supported'))
    return
  }

  parallel([
    !config.allowPrivateHosts && isPrivateUrl(url),
    config.allowRequest
  ].filter(Boolean), (err, results) => {
    if (err) {
      callback(err)
      return
    }

    if (!results.every(Boolean)) {
      callback(Boom.badRequest('URL not allowed'))
      return
    }

    const httpStream = needle.get(url).on('readable', emitErrorOnHttpError)
    callback(null, httpStream)
  })
}

function emitErrorOnHttpError() {
  const {statusCode, statusMessage} = this.request.res
  if (statusCode < 400) {
    return
  }

  const err = statusCode >= 500
    ? Boom.badGateway(statusMessage)
    : Boom.create(statusCode, statusMessage)

  this.emit('error', err)
  this.unpipe()
}

function isPrivateUrl(url) {
  return cb => urlIsPrivate.isPrivate(url, (err, isPrivate) => {
    cb(err, !isPrivate)
  })
}

module.exports = {
  name: 'proxy',
  type: 'source',
  handler: proxySource,
  getImageStream
}