Page({
    data: {
      isLoading: true,
      progress: 0
    },
    onLoad() {
      // 模拟数据请求并更新进度条
      const intervalId = setInterval(() => {
        const currentProgress = this.data.progress;
        if (currentProgress < 100) {
          this.setData({
            progress: currentProgress +1
          });
        } else {
          clearInterval(intervalId);
          this.setData({
            isLoading: false,
            progress: 0
          });
        }
      }, 1000);
    }
  });