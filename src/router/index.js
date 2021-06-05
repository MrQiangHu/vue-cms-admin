import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
// const dashboard = resolve => require(['../views/dashboard/index'], resolve)
/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRouterMap = [
  // 选择尺寸重定向
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: '首页',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  }
  // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
]
// 异步挂载的路由
// 动态需要根据权限加载的路由表
export const asyncRouterMap = [
  {
    path: '/example',
    component: Layout,
    redirect: '/example/table',
    name: 'example',
    meta: { title: '后台管理', icon: 'example', roles: ['admin', 'daili', 'yunwai', 'super_editor'] },
    children: [
      {
        path: 'table',
        name: 'table',
        component: () => import('@/views/table/complex-table'),
        meta: { title: '代理管理', icon: 'table', roles: ['admin', 'daili', 'super_editor'] }
      },
      {
        path: 'tree',
        name: 'tree',
        component: () => import('@/views/table/socketList'),
        meta: { title: '窗口管理', icon: 'tree', roles: ['admin', 'daili', 'super_editor'] }
      },
      {
        path: 'test',
        name: 'test',
        component: () => import('@/views/table/order-table'),
        meta: { title: '订单列表', icon: 'tree', roles: ['admin', 'daili', 'yunwai', 'super_editor'] }
      },
      {
        path: 'ticket',
        name: 'ticket',
        component: () => import('@/views/table/ticket-List'),
        meta: { title: '淘口令列表', icon: 'table', roles: ['admin', 'super_editor'] }
      },
      {
        path: 'czrecord',
        name: 'czrecord',
        component: () => import('@/views/table/czrecord-List'),
        meta: { title: '充值记录列表', icon: 'table', roles: ['admin', 'super_editor'] }
      },
      {
        path: 'tjb',
        name: 'tjb',
        component: () => import('@/views/system/tjb-list'),
        meta: { title: '特价版窗口', icon: 'table', roles: ['admin', 'daili', 'super_editor'] }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/system',
    name: 'example',
    meta: { title: '系统管理', icon: 'nested', roles: ['admin', 'super_editor'] },
    children: [
      {
        path: 'gonggao',
        name: 'gonggao',
        component: () => import('@/views/system/gonggao-list'),
        meta: { title: '公告管理', icon: 'form', roles: ['admin', 'super_editor'] }
      },
      {
        path: 'jiesuan',
        name: 'jiesuan',
        component: () => import('@/views/system/jiesuan'),
        meta: { title: '结算管理', icon: 'table', roles: ['admin', 'super_editor'] }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/user',
    name: 'example',
    meta: { title: '用户数据', icon: 'nested', roles: ['admin', 'user'] },
    children: [
      {
        path: 'userorder',
        name: 'userorder',
        component: () => import('@/views/table/user-order'),
        meta: { title: '用户订单', icon: 'table', roles: ['admin', 'user'] }
      }, {
        path: 'userproxy',
        name: 'userproxy',
        component: () => import('@/views/table/user-proxy'),
        meta: { title: '代理管理', icon: 'table', roles: ['user'] }
      }
    ]
  }
  // { path: '*', redirect: '/404', hidden: true }
]

// const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
// 实例化vue的时候只挂载constantRouter
export default new Router({
  routes: constantRouterMap
})
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
const router = createRouter()
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}
