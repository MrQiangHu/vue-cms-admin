/*
 * @Author: your name
 * @Date: 2020-04-29 14:03:57
 * @LastEditTime: 2021-05-15 15:37:41
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vue-cms-admin\src\api\user.js
 */
import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/users/info',
    method: 'post',
    params: { token },
    withCredentials: true
  })
}

export function logout() {
  return request({
    url: '/users/logout',
    method: 'post'
  })
}
