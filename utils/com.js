function getpicbase64(tempFilePath){
        return new Promise(function (resolve,reject){
            wx.getFileSystemManager().readFile({
                filePath:tempFilePath,
                encoding:"base64",
                success:function(data){
                    console.log(data);
                    resolve(data);
                }
            })
        })
    }
    
module.exports={
       getpicbase64:getpicbase64
    }