// 发送ajax请求
import config from './config' // 服务器信息对象
export default (url, data={}, method="GET") => {
  return new Promise((resolve, reject) => {
    // 初始化promise实例的状态为pending
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
      },
      success: (res) => {
        if(data.isLogin) {
          // 将用户cookie存储至本地
          wx.setStorage({
            key: 'cookies',
            data: res.cookies
          })
        }
        resolve(res.data)
      },
      fail: (err) => {
        // console.log(err)
        reject(err)
      }
    })
  })
}
