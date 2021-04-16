/*
 * @Author: your name
 * @Date: 2020-04-29 14:03:57
 * @LastEditTime: 2021-04-08 03:26:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vue-cms-admin\src\api\table.js
 */
import request from '@/utils/request'

export function getList(params) {
  // 获取列表的数据

  return request({
    url: '/users/getProxyList',
    method: 'get',
    params
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
