// pages/songDetail/songDetail.js
import pubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../utils/request'
// 获取全局实例
const appInstance = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,
    song: {},
    musicId: '',
    lyric: [],
    lyricTime: 0,
    currentLyric: '', // 当前显示的歌词
    musicLink: '',
    currentTime: '00:00',
    durationTime: '00:00',
    currentWidth: 0, // 实时进度条宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // options:接收路由跳转的query参数
  // 对参数长度有限制
  onLoad: function (options) {
    // console.log(options.song);
    // console.log(JSON.parse(options.song));
    let musicId = options.musicId
    this.setData({
      musicId
    })
    this.getMusicInfo(musicId)
    this.getLyric(musicId)
    // 判断当前页面音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId == musicId) {
      // 修改当前页面音乐播放状态为true
      this.setData({
        isPlay: true
      })
    }
    // 创建控制音乐播放的实例
    this.backgroudAudioManager = wx.getBackgroundAudioManager()
    // 监视音乐播放、暂停或停止
    this.backgroudAudioManager.onPlay(() => {
      this.changePlayState(true)
      // 将音乐id记录在全局数据中
      appInstance.globalData.musicId = musicId
    })
    this.backgroudAudioManager.onPause(() => {
      this.changePlayState(false)
    })
    this.backgroudAudioManager.onStop(() => {
      this.changePlayState(false)
    })
    this.backgroudAudioManager.onEnded(() => {
      // 订阅来自recommendSong页面发布的musicId的消息
      pubSub.subscribe('musicId', (_, musicId) => {
        console.log(musicId);
        // 获取音乐详情信息
        this.getMusicInfo(musicId)
        // 自动播放当前音乐
        this.musicControl(true, musicId)
        // 取消订阅(会重复订阅)
        pubSub.unsubscribe('musicId')
      })
      // 自动切换至下一首音乐且播放
      pubSub.publish('switchType', 'next')
      // 将进度条长度还原至0
      this.setData({
        currentWidth: 0,
        currentTime: '00:00',
        lyric: [],
        lyricTime: 0
      })
    })
    // 监听音乐实时播放进度
    this.backgroudAudioManager.onTimeUpdate(() => {
      let currentTime = moment(this.backgroudAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroudAudioManager.currentTime / this.backgroudAudioManager.duration * 450
      let lyricTime = Math.floor(this.backgroudAudioManager.currentTime)
      this.setData({
        currentTime,
        currentWidth,
        lyricTime
      })
      this.handleCurrentLyric()
    })
  },

  // 获取音乐详情
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', { ids: musicId })
    let durationTime = moment(songData.songs[0].dt).format('mm:ss')
    this.setData({
      song: songData.songs[0],
      durationTime
    })
    // 动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name + '-' + this.data.song.ar[0].name,
    })
  },

  // 获取歌词
  async getLyric(musicId) {
    let lyricData = await request('/lyric', { id: musicId })
    this.formatLyric(lyricData.lrc.lyric)
  },

  // 格式化歌词
  formatLyric(text) {
    let res = []
    // 通过换行符切割字符串
    let arr = text.split('\n')
    // 获取歌词行数
    let row = arr.length
    for(let i = 0; i < row - 1; i++) {
      // 结构：'[00:02.302][00:05.003]xxxxxxx'
      let temp_row = arr[i]
      // 分离时间和文本
      let temp_arr = temp_row.split(']') // '[00:02.302', '[00:05.003', 'xxxxxx'
      let temp_text = temp_arr.pop() // 'xxxxxx'
      // 处理时间
      temp_arr.forEach(item => {
        let obj = {}
        let time_arr = item.substr(1, item.length - 1).split(':') // '00', '02.302'
        let s = parseInt(time_arr[0]) * 60 + Math.floor(time_arr[1])
        obj.time = s
        obj.text = temp_text
        res.push(obj)
      })
    }
    res.sort((a, b) => {a.time -b.time})
    console.log(res);
    this.setData({
      lyric: res
    })
  },

  // 控制歌词播放
  handleCurrentLyric() {
    for(let i = 0; i < this.data.lyric.length - 1; i++) {
      if(this.data.lyricTime == this.data.lyric[i].time) {
        this.setData({
          currentLyric: this.data.lyric[i].text
        })
      }
    }
  },

  // 点击播放或暂停
  handleMusicPlay() {
    let isPlay = !this.data.isPlay
    let { musicId, musicLink } = this.data
    this.musicControl(isPlay, musicId, musicLink)
  },

  // 控制音乐播放或暂停
  async musicControl(isPlay, musicId, musicLink) {
    if(isPlay) { // 播放
      if(!musicLink) {
        // 获取音乐播放链接
        let musicLinkData = await request('/song/url', { id: musicId })
        musicLink = musicLinkData.data[0].url
        this.setData({
          musicLink
        })
        this.backgroudAudioManager.src = musicLink
      }
      this.backgroudAudioManager.title = this.data.song.name
    } else { // 暂停
      this.backgroudAudioManager.pause()
    }
  },

  // 修改播放状态
  changePlayState(isPlay) {
    this.setData({
      isPlay
    })
    // 修改全局音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay
  },

  // 点击切歌
  handleSwitch(event) {
    let type = event.currentTarget.id
    // 关闭当前播放的音乐
    this.backgroudAudioManager.stop()
    // 订阅来自recommendSong页面发布的musicId的消息
    pubSub.subscribe('musicId', (_, musicId) => {
      console.log(musicId);
      // 获取音乐详情信息
      this.getMusicInfo(musicId)
      // 自动播放当前音乐
      this.musicControl(true, musicId)
      // 取消订阅(会重复订阅)
      pubSub.unsubscribe('musicId')
    })
    // 发布消息数据给recommenSong页面
    pubSub.publish('switchType', type)
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