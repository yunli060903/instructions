Page({
  handleCamera() {
    this.chooseImage('camera');
  },

  handleAlbum() {
    this.chooseImage('album');
  },

  chooseImage(sourceType) {
    wx.chooseImage({
      sourceType: [sourceType],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.uploadImage(tempFilePath);
      }
    });
  },

  uploadImage(filePath) {
    wx.showLoading({ title: '转换中...' });

    wx.uploadFile({
      url: 'http://127.0.0.1:8000/api/process_image/',
      filePath: filePath,
      name: 'image',
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const text = JSON.parse(res.data).text;
            wx.navigateTo({
              url: `/pages/result/result?text=${encodeURIComponent(text)}`
            });
          } catch (e) {
            wx.showToast({ title: '数据解析失败', icon: 'error' });
          }
        } else {
          wx.showToast({ title: '转换失败', icon: 'error' });
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络错误', icon: 'error' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
});