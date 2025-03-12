// app.js
App({
  onLaunch() {
    // 小程序初始化逻辑
    this.checkBackgroundFetchPermission();
  },
  globalData: {
    // 全局共享数据
  },
  checkBackgroundFetchPermission() {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.backgroundFetch']) {
          wx.authorize({
            scope: 'scope.backgroundFetch',
            success() {
              console.log('用户已授予背景拉取权限');
            },
            fail() {
              console.log('用户拒绝授予背景拉取权限');
            }
          });
        }
      }
    });
  }
});