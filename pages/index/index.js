// pages/index/index.js
import request from "../../utils/request"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],
    recommendList: [],
    topList: [], 
    topListSong: [], //排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 获取banner数据
    let bannerListData = await request('/banner', {type: 2})
    this.setData({
      bannerList: bannerListData.banners
    })
    // 获取推荐歌单
    let recommendListData = await request('/personalized', {limit: 10})
    this.setData({
      recommendList: recommendListData.result
    })
    // 获取排行榜id
    let topListData = await request('/topList/detail')
    topListData = topListData.list.splice(0, 5)
    this.setData({
      topList: topListData
    })
    // 根据id获取榜单歌曲数据
    let index = 0
    let resArr = []
    while(index < 5) {
      let TopListSongData = await request('/playlist/detail', {id: topListData[index++].id})
      TopListSongData = {
        name: TopListSongData.playlist.name, 
        id: TopListSongData.playlist.name,
        tracks: TopListSongData.playlist.tracks.splice(0,3)
      }
      resArr.push(TopListSongData)
      // 不需要等待5次请求全部结束才更新，用户体验较好，但渲染次数增加
      this.setData({
        topListSong: resArr
      })
    }
    // this.setData({
    //   topListSong: resArr
    // })
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