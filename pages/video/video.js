// pages/video/video.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], // 导航标签数据
    navId: '', // 导航标识
    videoList: [], // 视频列表数据
    videoIndex: 0, //存储视频所标记到的id
    isTriggered: false, //标志下拉刷新是否触发
    offset: 0, // 当前视频列表数据分页
    loadedVideoList: [], // 上拉加载获取的数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getVideoGroupListData()
  },

  // 获取导航数据
  async getVideoGroupListData() {
    let videoGroupListData = await request('/video/group/list')
    this.setData({
      navId: videoGroupListData.data[0].id,
      videoGroupList: videoGroupListData.data.splice(0, 14)
    })
    this.getVideoList(this.data.navId)
  },

  // 获取视频列表数据
  async getVideoList(navId, offset = 0) {
    let videoListData = await request('/video/group', { id: navId, offset })
    let videoList
    // 获取到数据后关闭等待消息提示框
    wx.hideLoading()
    // 给数据对象添加id属性
    let index = 0
    if(videoListData.code !== 301) {
      videoList = videoListData.datas.map(item => {
        item.id = index++
        return item
      })
    } else {
      wx.showToast({
        title: '需要登录',
        icon: 'none'
      })
    }
    this.setData({
      videoId: index,
      videoList,
      // 关闭下拉刷新
      isTriggered: false
    })
  },

  // 获取上拉加载的视频数据
  async getLoadedVideoList(navId, offset) {
    let loadedVideoListData = await request('/video/group', { id: navId, offset })
    let index = this.data.videoId++
    let loadedVideoList = loadedVideoListData.datas.map(item => {
      item.id = index++
      return item
    })
    this.setData({
      loadedVideoList,
      videoId: index
    })
  },

  // 点击切换导航
  changeNav(event) {
    let navId = event.currentTarget.id
    this.setData({
      navId: Number(navId),
      // 先将之前的数据置为空
      videoList: []
    })
    // 显示正在加载（获取数据后手动调用关闭提示函数）
    wx.showLoading({
      title: '正在加载'
    })
    // 动态获取当前导航动态数据
    this.getVideoList(this.data.navId)
  },

  // 自定义下拉刷新：scroll-view
  handleRefresher() {
    // 再次发请求，获取最新的视频列表数据
    this.getVideoList(this.data.navId)
  },

  // 自定义上拉加载：scroll-view
  handleToLower() {
    // 数据分页
    this.getLoadedVideoList(this.data.navId, this.data.offset + 1)
    let videoList = this.data.videoList
    videoList.push(...this.data.loadedVideoList)
    this.setData({
      offset: this.data.offset + 1,
      videoList
    })
  },

  // 跳转至搜索页面
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
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
  onShareAppMessage: function ({ from }) {
    // console.log(from);
  }
})