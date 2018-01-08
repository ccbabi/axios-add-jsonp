var axios = require('axios')
var jsonp = require('jsonp')
var qs = require('qs')
var objectAssign = require('object-assign')
var Promise = require('es6-promise').Promise

var timeout = 60000
var instanceDefaults = {
  timeout: timeout,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
}

var jsonpDefaults = {
  timeout
}

function create (defaults = {}) {
  var instance = axios.create(objectAssign({}, instanceDefaults, defaults));

  ['get', 'delete', 'head', 'options'].forEach(function (method) {
    var superMethod = instance[method]
    instance[method] = function (url, data, config) {
      config = config || {}
      config.params = data || {}
      return superMethod(url, config)
    }
  })

  instance.jsonp = function (url, data, config) {
    config = objectAssign({}, jsonpDefaults, config)
    return new Promise(function (resolve, reject) {
      runHook(instance, 0)
      jsonp(makeUrlByData(url || '', data || {}), config, function (err, data) {
        runHook(instance, 1)
        if (err) return reject(err)
        else resolve(data)
      })
    })
  }

  instance.interceptors.request.use(function (config) {
    var contentType = config.headers['Content-Type']
    if (contentType === 'application/x-www-form-urlencoded') config.data = qs.stringify(config.data)
    runHook(instance, 0)
    return config
  }, function (error) {
    runHook(instance, 1)
    return Promise.reject(error)
  })

  instance.interceptors.response.use(function (response) {
    runHook(instance, 1)
    return response.data
  }, function (error) {
    runHook(instance, 1)
    return Promise.reject(error)
  })

  return instance
}

function makeUrlByData (url, data) {
  var search = qs.stringify(data, { addQueryPrefix: true })
  url += ~url.indexOf('?') ? search.replace('?', '&') : search
  url = url.replace('?&', '?')
  return url
}

function isFunction (func) {
  return typeof func === 'function'
}

// 废除单例：runRequesHook、runResponseHook
// 外部可动态替换hook值
function runHook (instance, type) {
  var hook = `${type ? 'response' : 'request'}Hook`
  if (instance[hook] && isFunction(instance[hook])) {
    instance[hook]()
  }
}

module.exports = {
  request: create(),
  create: create,
  nativeAxios: axios,
  nativeJsonp: jsonp
}
