# axios-add-jsonp
Add a jsonp method to axios

## Install
```sh
$ npm install axios-add-jsonp --save
```

## Example
Unifies all requests
```javascript
import request from 'axios-add-jsonp'

request.jsonp('/api/123', { bar: foo, foo: bar }).then(res => {
  // do some thing
})

request.get('/api/123', { bar: foo, foo: bar }).then(res => {
  // do some thing
})

request.post('/api/123', { bar: foo, foo: bar }).then(res => {
  // do some thing
})

```

The form request is created, and the mode of usage remains unchanged
```javascript
import { create } from 'axios-add-jsonp'

const request = create({
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

request.post('/api/123', { bar: foo, foo: bar }).then(res => {
  // do some thing
})

```

## Api
The usage method is basically the same as axios and jsonp, see [axios](https://github.com/axios/axios) and [jsonp](https://github.com/webmodules/jsonp).

Format is as follows:

`request.<method>(<url>, [<data>], [<config>]): Promise`

Note: all methods are in this format, including GET, DELETE, HEAD, OPTIONS.

## License
MIT
