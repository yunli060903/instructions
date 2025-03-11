Page({
  data: {
    textContent: ''
  },

  onLoad(options) {
    if (options.text) {
      this.setData({
        textContent: decodeURIComponent(options.text)
      });
    }
  }
});