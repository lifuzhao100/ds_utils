const Router = require('@koa/router')
const uid = require('./uid')

const mainRouter = new Router({
  prefix: '/api'
})

const cascade = (_routes, router) => {
  _routes.forEach(route => {
    let _router
    if (!route.router && Array.isArray(route.routes)) {
      _router = new Router()
      cascade(route.routes, _router)
    } else if (route.router) {
      _router = route.router
    }
    if (_router) {
      router.use('/' + route.name, _router.routes(), _router.allowedMethods())
    }
  })
  return router
}

cascade([
  uid,
], mainRouter)

module.exports = mainRouter