const Router = require('@koa/router')
const axios = require('axios')
const cheerio = require('cheerio')

const router = new Router()
const instance = axios.create({})

let cookie = 'kuaishou.live.bfb1s=ac5f27b3b62895859c4c1622f49856a4; clientid=3; did=web_2911a371fc7710203ae0b251aba1d97f; client_key=65890b29; kpn=GAME_ZONE; userId=2108044669; kuaishou.live.web_st=ChRrdWFpc2hvdS5saXZlLndlYi5zdBKgAYgl0sEHZSzuecCAa3rkengVEmUgPfBrRUR-A1ICImZZR9i6YipmIE0BWrq2ztK0nBrlHwnRl0iviLMqg6tbQUVjxgqE7y2-CFuHoquYYmyN_1AjVxjTkRWJZoXRSza30c19vxtUavUMYgmhugpgI2Ene4NSRr86DCdc3SmQnBfj3w-Ij297U-14WC0ulDEYpo_KTIFRGuwJK9p3DeIiOnMaEvrof_XznEP1qd2QsxhyybtifyIg-sI9LNL0mIbJ-Za2yNXIoxBpiSHRijdP7J_NWsD9ukIoBTAB; kuaishou.live.web_ph=1f0ffd16ea14ba69cedf4b93fca872118488; userId=2108044669'

function request(_url, entity) {
  const isPcUserPage = /\/profile\//.test(_url)

  const headers = {
    Cookie: entity.cookie || cookie,
    Referer: _url,
  }
  if (!isPcUserPage) {
    headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
  }
  entity.cookie = headers.Cookie
  return instance.get(_url, {
    headers,
  }).then(res => {
    const $ = cheerio.load(res.data)
    const auth = $('.auth-info-bar')
    const isMobileVideoPage = auth.length > 0
    if (isMobileVideoPage) {
      return mobileVideoPage($, entity)
    } else if (isPcUserPage) {
      return pcUserPage($, entity)
    }
  }).catch(err => {
    entity.message = err.status + err.statusText
  })
}

function mobileVideoPage($, entity) {
  const selectors = [
    'auth-info-container',
    'open-user-profile',
  ]
  for (const selector of selectors) {
    const ele = $(`.${selector}`)[0]
    if (!ele) continue
    const origin = ele.attribs['data-scheme-url']
    if (!origin) continue
    const username = $('.auth-name')
    const uid = origin.replace('kwai://profile/', '')
    if (uid && !uid.includes('undefined')) {
      entity.success = true
      entity.data = {
        uid: uid,
        username: username.text(),
      }
      break
    }
  }
  return entity
}

function pcUserPage($, entity) {
  const scripts = $('script');
  let videoId, did
  for (let script of scripts) {
    const s = $(script)
    if (s.attr('src') !== undefined) continue
    const child = script.children[0]
    let origin = child && child.data
    if (!origin) continue
    if (!origin.includes('window.__APOLLO_STATE__')) continue
    origin = origin.replace('window.__APOLLO_STATE__=', '').replace(/;.*;/, '')
    try {
      const state = JSON.parse(origin)
      const {clients: {graphqlServerClient}} = state
      const rootQueryPcConfig = graphqlServerClient['$ROOT_QUERY.pcConfig']
      const keys = Object.keys(graphqlServerClient)
      did = rootQueryPcConfig.did
      for (let key of keys) {
        if (key.startsWith('$ROOT_QUERY.publicFeeds')) {
          const list = graphqlServerClient[key].list
          const firstItem = list[0]
          if (!firstItem) continue
          const {type, typename} = firstItem
          videoId = firstItem[type].replace(`${typename}:`, '')
          break
        }
      }
    } catch (err) {
      entity.message = '解析json出错'
      return entity
    }
  }
  if (!videoId) {
    entity.message = '获取videoId失败，请输入作品页链接或者传入cookie'
    return entity
  }
  return request(`https://m.gifshow.com/fw/photo/${videoId}?did=${did}`, entity)
}

router.post('/', async (ctx, next) => {
  const {url: _url, cookie: _cookie} = ctx.request.body
  const entity = {
    success: false,
    message: null,
    data: null,
    cookie: _cookie,
  }
  await request(_url, entity)
  if (entity.message === null) {
    entity.message = entity.success ? '操作成功' : '操作失败'
  }
  if (entity.success) {
    cookie = entity.cookie
  }
  ctx.body = entity
})

exports.name = 'kuaishou'
exports.router = router