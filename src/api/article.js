/*
 * @Author: your name
 * @Date: 2021-04-08 03:42:13
 * @LastEditTime: 2021-05-21 20:29:50
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
export function gonggao_list(query) {
  return request({
    url: '/users/getGonggaoList',
    method: 'post',
    data: query
  })
}
export function tjbList(query) {
  return request({
    url: '/users/getAllTjbDevice',
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
export function UserOrder(query) {
  return request({
    url: '/users/getUserOrderList',
    method: 'post',
    data: query
  })
}
export function czrecordList(query) {
  return request({
    url: '/users/czrecordList',
    method: 'post',
    data: query
  })
}
export function TicketList(query) {
  return request({
    url: '/users/getTicketList',
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
export function deleteUser(servicepackage, servicename, params) {
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
