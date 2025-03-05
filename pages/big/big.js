// pages/big/big.js
  /**
   * 页面的初始数据
   */
  Page({
    data: {
      imageSrc: 'https://q0.itc.cn/images01/20240309/2e48fc1a7a024812bcd810ae6f761e98.png', // 替换为实际的图片链接
      isMagnifying: false,
      magnifierX: 0,
      magnifierY: 0,
      scale: 2 // 放大倍数
    },
  
    onTouchStart(e) {
      this.setData({
        isMagnifying: true
      });
      this.updateMagnifierPosition(e.touches[0].pageX, e.touches[0].pageY);
    },
  
    onTouchMove(e) {
      this.updateMagnifierPosition(e.touches[0].pageX, e.touches[0].pageY);
    },
  
    onTouchEnd() {
      this.setData({
        isMagnifying: false
      });
    },
    updateMagnifierPosition(x, y) {
        const { scale } = this.data;
        const magnifierSize = 150;
        const halfSize = magnifierSize / 2;
    
        // 计算放大镜的位置
        const magnifierX = x - halfSize;
        const magnifierY = y - halfSize;
    
        this.setData({
            magnifierX,
            magnifierY
        });
    
        wx.getImageInfo({
            src: this.data.imageSrc,
            success: (res) => {
                // 获取 canvas 上下文
                const ctx = wx.createCanvasContext('magnifierCanvas', this);
                // 绘制放大后的图像
                ctx.drawImage(this.data.imageSrc, x - halfSize / scale, y - halfSize / scale, magnifierSize / scale, magnifierSize / scale, 0, 0, magnifierSize, magnifierSize);
                ctx.draw();
            },
            fail: (err) => {
                console.error('获取图片信息失败', err);
            }
        });
    }