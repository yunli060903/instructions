Page({
  data: {
      textContent: ''
  },
  onLoad(options) {
      console.log('接收到的参数:', options);
      if (options.text) {
          this.setData({
              textContent: decodeURIComponent(options.text)
          });
      } else {
          wx.showToast({ title: '未接收到文本数据', icon: 'error' });
          console.error('未接收到文本数据');
      }
  }
});