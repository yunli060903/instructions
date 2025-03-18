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
  },

  onReady() {
    // 绘制相机
    const cameraQuery = wx.createSelectorQuery();
    cameraQuery.select('#cameraCanvas')
     .fields({ node: true, size: true })
     .exec((res) => {
        if (res[0]) {
          const cameraCanvas = res[0].node;
          const cameraCtx = cameraCanvas.getContext('2d');
          if (cameraCtx) {
            const { width, height } = res[0];
            this.drawCamera(cameraCtx, width, height);
            cameraCtx.draw();
          } else {
            console.error('无法获取相机 canvas 上下文');
          }
        } else {
          console.error('未找到相机 canvas');
        }
      });

    // 绘制放大镜
    const magnifierQuery = wx.createSelectorQuery();
    magnifierQuery.select('#magnifierCanvas')
     .fields({ node: true, size: true })
     .exec((res) => {
        if (res[0]) {
          const magnifierCanvas = res[0].node;
          const magnifierCtx = magnifierCanvas.getContext('2d');
          if (magnifierCtx) {
            const { width, height } = res[0];
            this.drawMagnifier(magnifierCtx, width, height);
            magnifierCtx.draw();
          } else {
            console.error('无法获取放大镜 canvas 上下文');
          }
        } else {
          console.error('未找到放大镜 canvas');
        }
      });
  },

  drawCamera(ctx, width, height) {
    const scale = Math.min(width, height) / 200; // 根据 canvas 尺寸计算缩放比例
    const centerX = width / 2;
    const centerY = height / 2;

    // 保存当前绘图状态
    ctx.save();
    // 移动到画布中心
    ctx.translate(centerX, centerY);
    // 逆时针旋转 90°
    ctx.rotate(-Math.PI / 2);
    // 移动回原来的坐标系原点
    ctx.translate(-centerX, -centerY);

    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 4 * scale;
    const cameraWidth = 140 * scale;
    const cameraHeight = 140 * scale;
    const cameraX = centerX - cameraWidth / 2;
    const cameraY = centerY - cameraHeight / 2;
    ctx.strokeRect(cameraX, cameraY, cameraWidth, cameraHeight);

    // 相机镜头
    const lensRadius = 40 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, lensRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // 相机闪光灯
    ctx.fillStyle = '#d0d0d0';
    const flashX = centerX + (40 * scale);
    const flashY = centerY - (50 * scale);
    const flashSize = 20 * scale;
    ctx.fillRect(flashX, flashY, flashSize, flashSize);

    // 恢复绘图状态
    ctx.restore();
  },

  drawMagnifier(ctx, width, height) {
    const scale = Math.min(width, height) / 200; // 根据 canvas 尺寸计算缩放比例
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 4 * scale;

    // 放大镜镜片
    const lensRadius = 50 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, lensRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // 放大镜手柄
    ctx.beginPath();
    const handleStartX = centerX + (30 * scale);
    const handleStartY = centerY + (30 * scale);
    const handleEndX = centerX + (60 * scale);
    const handleEndY = centerY + (60 * scale);
    ctx.moveTo(handleStartX, handleStartY);
    ctx.lineTo(handleEndX, handleEndY);
    ctx.lineTo(handleEndX - (10 * scale), handleEndY + (10 * scale));
    ctx.lineTo(handleStartX - (10 * scale), handleStartY + (10 * scale));
    ctx.closePath();
    ctx.stroke();
  }
});