// pages/picpage/picpage.js

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  getpic:function(){
    const ctx=wx.createCameraContext()
    ctx.takePhoto({
        quality:'low',
        success:(res)=>{
            console.log("图片临时地址为:"+res.tempImagePath);
            
        }
    })
}
})