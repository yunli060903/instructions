// pages/picpage/picpage.js

Page({
    data: {
      imageSrc: 'C:\Users\save\Pictures\微信小程序' // 用于存储拍摄照片的路径，初始值设为空
    },
    takePhoto: function () {
      const that = this;
      wx.chooseImage({
        count: 1, // 只选择一张图片，即拍一张照片
        sourceType: ['camera'], // 指定图片来源为相机
        success: function (res) {
          that.setData({
            imageSrc: res.tempFilePaths[0] // 将拍摄的照片路径存储到imageSrc中
          });
        }
      });
    },
    getpic: function () {
      const ctx = wx.createCameraContext();
      ctx.takePhoto({
        quality: 'low',
        success: (res) => {
          console.log("图片临时地址为:" + res.tempImagePath);
          // 若需要更新页面显示，可以在这里设置 data 中的 imageSrc
          this.setData({
            imageSrc: res.tempImagePath
          });
        }
      });
    }
  });