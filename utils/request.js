// 发送ajax请求
import config from './config' // 服务器信息对象
export default (url, data={}, method="GET") => {
  return new Promise((resolve, reject) => {
    // 初始化promise实例的状态为pending
    wx.request({
      url: config.host + url,
      data,
      method,
      success: (res) => {
        // console.log(res)
        resolve(res.data)
      },
      fail: (err) => {
        // console.log(err)
        reject(err)
      }
    })
  })
}
