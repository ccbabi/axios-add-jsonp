import axios from 'axios'
import jsonp from 'jsonp'
import qs from 'qs'

const timeout = 60000

const instanceDefaults = {
  timeout,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
}

const jsonpDefaults = {
  timeout
}

export default create()

export const nativeAxios = axios

export const nativeJsonp = jsonp

export function create (defaults = {}) {
  const instance = axios.create({ ...instanceDefaults, ...defaults })

  for (let method of ['get', 'delete', 'head', 'options']) {
    const superMethod = instance[method]
    instance[method] = function (url, data = {}, config = {}) {
      config.params = data
      return superMethod(url, config)
    }
  }

  instance.jsonp = function (url, data = {}, config = {}) {
    config = { ...jsonpDefaults, ...config }
    return new Promise((resolve, reject) => {
      runHook(instance, 0)
      jsonp(makeUrlByData(url, data), config, (err, data) => {
        runHook(instance, 1)
        if (err) return reject(err)
        else resolve(data)
      })
    })
  }

  instance.interceptors.request.use(config => {
    const contentType = config.headers['Content-Type']
    if (contentType === 'application/x-www-form-urlencoded') config.data = qs.stringify(config.data)
    runHook(instance, 0)
    return config
  }, error => {
    runHook(instance, 1)
    return Promise.reject(error)
  })

  instance.interceptors.response.use(response => {
    runHook(instance, 1)
    return response.data
  }, error => {
    runHook(instance, 1)
    return Promise.reject(error)
  })

  return instance
}

function makeUrlByData (url = '', data = {}) {
  const search = qs.stringify(data, { addQueryPrefix: true })
  url += url.includes('?') ? search.replace('?', '&') : search
  return url
}

function isFunction (func) {
  return typeof func === 'function'
}

// 废除单例：runRequesHook、runResponseHook
// 外部可动态替换hook值
function runHook (instance, type) {
  const hook = `${type ? 'response' : 'request'}Hook`
  if (instance[hook] && isFunction(instance[hook])) {
    instance[hook]()
  }
}
