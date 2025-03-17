# api使用

## 环境

python 3.12

## 所需下载的库

requests：调用百度ai，发送https请求

django：web架构

```
pip install requests
pip install django
```

## 操作方法

```
run manage.py runserver
```

在api目录下运行上述指令，开启服务

## 接口

```
http://127.0.0.1:8000/api/process_image/
```

## 百度ai的调用

如遇到百度ai中npl次数没有了有一下账号可使用

hp：

​	apikey:  wlG8vZ0JoyV4BFKte2GV9EPL

​	secretkey:  7Qu7oMoou44el1KtO35qtmECeoK0iZmg

hzh：

​	apikey：1aivsZ8CFjykCtCk5w4Xea7M

​	secretkey：MCUxYP73OzCUGM5yBp1QhTyY1l6QYHhh

lsl：

​	apikey:   nOr0A2gLO0UJPPg4JFGaCI7w

​	secretkey:   GSAdjtnvpSFUlcNUqqw0W6xUmfIYyEgM

如果都无次数请使用hzh的，并通知hzh购买次数。

## 实现功能

读取药瓶说明书图片并返回用法用量。