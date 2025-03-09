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

## 实现功能

读取药瓶说明书图片并返回用法用量。