/*
 * @Author: your name
 * @Date: 2021-04-08 03:42:13
 * @LastEditTime: 2021-04-14 14:43:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vue-cms-admin\src\api\article.js
 */
import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/users/getProxyList',
    method: 'post',
    data: query
  })
}
export function OrderList(query) {
  return request({
    url: '/users/getOrderList',
    method: 'post',
    data: query
  })
}

export function SocketList(query) {
  return request({
    url: '/breeze/getSocketList',
    method: 'post',
    data: query
  })
}
export function updateStatus(servicepackage, servicename, params) {
  const postdata = {}
  postdata.param = params
  postdata.servicepackage = servicepackage
  postdata.servicename = servicename
  // 根据ID修改对应状态
  return request({
    url: '/breeze/doServer',
    method: 'post',
    data: postdata
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(params) {
  const postdata = {}
  postdata.param = params
  postdata.servicepackage = 'user.install'
  postdata.servicename = 'addPorxy'
  // 根据ID修改对应状态
  return request({
    url: '/breeze/doServer',
    method: 'post',
    data: postdata
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}
