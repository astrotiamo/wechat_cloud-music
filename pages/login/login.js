// pages/login/login.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    password: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  handleInputPhone(event) {
    this.setData({
      phone: event.detail.value
    })
  },
  handleInputPassword(event) {
    this.setData({
      password: event.detail.value
    })
  },

  async login() {
    // 收集表单项数据
    let { phone, password } = this.data
    if(!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'error'
      })
      return
    }
    // 定义手机号正则
    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
    if(!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'error'
      })
      return
    }
    if(!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'error'
      })
      return
    }
    // 后端验证
    let res = await request('/login/cellphone', { phone, password, isLogin: true })
    if(res.code === 200) {
      // wx.showToast({
      //   title: '登录成功'
      // })

      // 将用户信息存储至本地
      wx.setStorageSync('userInfo', JSON.stringify(res.profile))
      // 跳转至个人中心
      wx.reLaunch({
        url: '/pages/personal/personal'
      })
    } else {
      wx.showToast({
        title: '手机号或密码错误',
        icon: 'error'
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})