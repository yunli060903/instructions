// components/snowflakes/snowflakes.js
const { createSnowflakes } = require('../../utils/animation');

Component({
  lifetimes: {
    ready() {
      const query = wx.createSelectorQuery().in(this);
      query.select('#snowCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const systemInfo = wx.getSystemInfoSync();
          const dpr = systemInfo.pixelRatio;
          const { windowWidth, windowHeight } = wx.getWindowInfo();

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          canvas.width = windowWidth * dpr;
          canvas.height = windowHeight * dpr;
          ctx.scale(dpr, dpr);
          createSnowflakes(ctx, windowWidth, windowHeight);
        });
    }
  }
});