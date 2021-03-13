const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const router = require('./router')

const app = new Koa()
app.use(bodyParser())
app.use(router.routes(), router.allowedMethods())
app.listen(8899, () => {
  console.log("server is listening at 8899")
})