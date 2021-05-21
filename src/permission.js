/*
 * @Author: your name
 * @Date: 2020-04-29 14:03:57
 * @LastEditTime: 2021-05-15 14:01:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vue-cms\vue-cms-admin\src\permission.js
 */
import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
// import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = '探花后台管理系统'

  // determine whether the user has logged in
  // 查询 用户TOken
  const hasToken = getToken()
  // 如果有token则表明登陆成功
  if (hasToken) {
    // 没有登陆
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      // 获取VUEX里的名称？
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          // await store.dispatch('user/getInfo')
          // next()
          // get user info
          // await store.dispatch('user/getInfo')
          if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息
            // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
            const { roles } = await store.dispatch('user/getInfo')

            // generate accessible routes map based on roles
            const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

            // dynamically add accessible routes
            router.addRoutes(accessRoutes)

            // hack method to ensure that addRoutes is complete
            // set the replace: true, so the navigation will not leave a history record
            next({ ...to, replace: true })
          } else {
            next() // 当有用户权限的时候，说明所有可访问路由已生成 如访问没权限的全面会自动进入404页面
          }
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly

      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
