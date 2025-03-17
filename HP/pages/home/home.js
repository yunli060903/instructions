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
        if (tempFilePath) {
          this.uploadImage(tempFilePath);
        } else {
          wx.showToast({ title: '未成功获取图片路径', icon: 'error' });
        }
      },
      fail: (err) => {
        wx.showToast({ title: '选择图片失败', icon: 'error' });
        console.error('选择图片失败:', err);
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
                    const data = JSON.parse(res.data);
                    const text = data.result; // 从result字段提取数据
                    wx.navigateTo({
                        url: `/pages/result/result?text=${encodeURIComponent(text)}`
                    });
                } catch (e) {
                    wx.showToast({ title: '数据解析失败', icon: 'error' });
                    console.error('数据解析错误:', e, '返回的数据:', res.data);
                }
            } else {
                // 根据不同状态码给出更具体提示
                let errorMsg = `转换失败，状态码: ${res.statusCode}`;
                if (res.statusCode === 404) {
                    errorMsg = '接口未找到';
                } else if (res.statusCode === 500) {
                    errorMsg = '服务器内部错误';
                }
                wx.showToast({ title: errorMsg, icon: 'error' });
                console.error('接口返回状态码错误:', res.statusCode);
            }
        },
        fail: (err) => {
            wx.showToast({ title: '网络错误', icon: 'error' });
            console.error('网络请求失败:', err);
        },
        complete: () => {
            wx.hideLoading();
        }
    });
  }
});