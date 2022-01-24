// songPackage/pages/recommendPlayLists/recommendPlayLists.js
import request from '../../../utils/request'
import pubSub from 'pubsub-js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listId: '',
    listName: '',
    playList: [], // 歌曲数据
    listImg: '',
    discribe: '',
    index: 0, // 下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取歌单Id
    let listId = options.id
    this.setData({
      listId
    })
    this.getRecommendPlayList(listId)
    // 订阅来自songDetail发来的消息
    pubSub.subscribe('switchType', (_, type) => {
      let { playList, index } = this.data
      if(type == 'pre') {
        index == 0 && (index = playList.length)
        index -= 1
      } else if (type == 'next') {
        index == playList.length - 1 && (index = -1)
        index += 1
      }
      // 更新下标
      this.setData({
        index
      })
      let musicId = playList[index].id
      // 将musicId传给songDetail页面进行播放歌曲
      pubSub.publish('musicId', musicId)
    })
  },

  // 获取歌单数据
  async getRecommendPlayList(listId) {
    let playListData = await request('/playlist/detail', { id: listId })
    this.setData({
      playList: playListData.playlist.tracks,
      listName: playListData.playlist.name,
      listImg: playListData.playlist.coverImgUrl,
      discribe: playListData.playlist.description
    })
  },

  // 跳转至播放页面
  toSongDetail(event) {
    let { index, song } = event.currentTarget.dataset
    this.setData({
      index
    })
    wx.navigateTo({
      url: '/songPackage/pages/songDetail/songDetail?musicId=' + song.id,
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
  onShareAppMessage: function () {

  }
})