/*
 * @Author: huqiang
 * @Date: 2020-04-29 14:03:57
 * @LastEditTime: 2020-05-07 14:46:47
 * @LastEditors: Please set LastEditors
 * @Description: vuex仓库
 * @FilePath: \vue-cms\vue-cms-admin\src\store\getters.js
 */
const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  permission_routes: state => state.permission.routes,
  // 布局大小组件
  size: state => state.app.size,
  // 错误日志组件
  errorLogs: state => state.errorLog.logs

}
export default getters
