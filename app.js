// app.js
App({
  globalData: {
    userInfo: null,
    token: '',
    isLoggedIn: false,
    role: 'USER', // USER | TECHNICIAN | ADMIN | MANAGER
    baseUrl: 'https://10000cap.funtui.com/api'
  },

  onLaunch() {
    // 检查本地缓存的登录态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
      this.globalData.role = userInfo.role || 'USER';
    }
  },

  // 设置登录信息
  setLoginInfo(token, userInfo) {
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    this.globalData.role = userInfo.role || 'USER';
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', userInfo);
  },

  // 退出登录
  logout() {
    this.globalData.token = '';
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    this.globalData.role = 'USER';
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  },

  // 检查登录状态，未登录则跳转
  checkLogin() {
    if (!this.globalData.isLoggedIn) {
      wx.navigateTo({ url: '/pages/login/login' });
      return false;
    }
    return true;
  }
});
