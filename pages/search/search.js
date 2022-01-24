// pages/search/search.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '',
    hotList: [],
    searchContent: '',
    searchList: [],
    historyList: [],
    timer: '', // 定时器
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInitData()
    this.getSearchHistory()
  },

  // 获取初始化数据
  async getInitData() {
    let placeholderData = await request('/search/default')
    let hotListData = await request('/search/hot/detail')
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList: hotListData.data
    })
  },

  // 获取本地历史记录
  getSearchHistory() {
    let historyList = wx.getStorageSync('searchHistory')
    if(historyList) {
      this.setData({
        historyList
      })
    }
  },

  // 表单项内容发生改变的回调
  handleInputChange(event) {
    let that = this
    this.setData({
      searchContent: event.detail.value.trim()
    })
    clearTimeout(that.data.timer)
    // 防抖
    this.data.timer = setTimeout(() => {
      this.getSearchListData()
    }, 300);
  },

  // 发请求获取搜索内容
  async getSearchListData() {
    if(!this.data.searchContent) {
      return
    }
    let { searchContent, historyList } = this.data
    // 获取关键字模糊匹配数据
    let searchListData = await request('/search', { keywords: searchContent, limit: 10 })
    this.setData({
      searchList: searchListData.result.songs
    })
    // 将搜索关键字添加到搜索历史记录中
    if(historyList.indexOf(searchContent) !== -1) {
      historyList.splice(historyList.indexOf(searchContent), 1)
    }
    historyList.unshift(searchContent)
    this.setData({
      historyList
    })
    wx.setStorageSync('searchHistory', historyList)
  },

  // 清空搜索内容
  clearSearchContent() {
    this.setData({
      searchContent: '',
      searchList: []
    })
  },

  // 删除搜索历史记录
  deleteSearchHistory() {
    wx.showModal({
      content: '是否确认删除',
      success: (res) => {
        if(res.confirm) {
          this.setData({
            historyList: []
          })
          wx.removeStorageSync('searchHistory')
        }
      }
    })
  },

  // 点击热搜榜歌曲名搜索音乐
  searchHotSong(event) {
    console.log(event.currentTarget);
    this.setData({
      searchContent: event.currentTarget.dataset.hotwords
    })
    this.getSearchListData()
  },

  // 点击历史记录进行搜索
  searchHistory(event) {
    this.setData({
      searchContent: event.currentTarget.dataset.historywords
    })
    this.getSearchListData()
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