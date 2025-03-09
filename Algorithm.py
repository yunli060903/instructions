# coding=utf-8

import sys
import json
import base64
import requests
import time
from urllib.request import urlopen, Request
from urllib.error import URLError
from urllib.parse import urlencode, quote_plus

from django.contrib.admin.templatetags.admin_list import result_list, results
from django.db.models.functions import NullIf

# 保证兼容python2以及python3
IS_PY3 = sys.version_info.major == 3

# 防止https证书校验不正确
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

API_KEY = 'wlG8vZ0JoyV4BFKte2GV9EPL'
SECRET_KEY = '7Qu7oMoou44el1KtO35qtmECeoK0iZmg'
OCR_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic"
TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token'
NLP_URL = "https://aip.baidubce.com/rpc/2.0/nlp/v1/txt_monet"

def get_token():
    """
    获取百度AI开放平台的访问令牌
    :return: 访问令牌
    """
    params = {
        'grant_type': 'client_credentials',
        'client_id': API_KEY,
        'client_secret': SECRET_KEY
    }
    post_data = urlencode(params)
    if IS_PY3:
        post_data = post_data.encode('utf-8')
    req = Request(TOKEN_URL, post_data)
    try:
        f = urlopen(req, timeout=5)
        result_str = f.read()
        if IS_PY3:
            result_str = result_str.decode()
        result = json.loads(result_str)
        if 'access_token' in result and 'scope' in result:
            if 'brain_all_scope' not in result['scope'].split(' '):
                print('请确保已开通相应权限')
                sys.exit()
            return result['access_token']
        else:
            print('请检查并替换正确的API_KEY和SECRET_KEY')
            sys.exit()
    except URLError as err:
        print(f"获取Token时出现错误: {err}")
        sys.exit()

def read_image_file(image_path):
    """
    读取本地图片文件
    :param image_path: 图片文件路径
    :return: 图片文件内容
    """
    try:
        with open(image_path, 'rb') as f:
            return f.read()
    except Exception as e:
        print(f"读取图片文件时出现错误: {e}")
        return None

def perform_ocr(token, image_content):
    """
    调用百度OCR高精度通用文字识别接口
    :param token: 访问令牌
    :param image_content: 图片文件内容
    :return: 识别结果
    """
    image_url = OCR_URL + f"?access_token={token}"
    data = urlencode({'image': base64.b64encode(image_content)})
    req = Request(image_url, data.encode('utf-8'))
    try:
        f = urlopen(req)
        result_str = f.read()
        if IS_PY3:
            result_str = result_str.decode()
        return json.loads(result_str)
    except URLError as err:
        print(f"OCR识别时出现错误: {err}")
        return None

def query_nlp(token, text):
    """
    调用百度NLP文本挖掘接口，查询“用法用量”相关信息
    :param token: 访问令牌
    :param text: 待查询的文本
    :return: 接口响应结果
    """
    url = NLP_URL + f"?access_token={token}"
    payload = json.dumps({
        "content_list": [
            {
                "content": text,
                "query_list": [
                    {
                        "query": "用法用量"
                    }
                ]
            }
        ]
    }, ensure_ascii=False)
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    try:
        response = requests.post(url, headers=headers, data=payload.encode("utf-8"))
        return response.text
    except requests.RequestException as e:
        print(f"NLP查询时出现错误: {e}")
        return None

if __name__ == '__main__':
    # 获取访问令牌
    token = get_token()

    # 读取图片文件
    image_content = read_image_file('./ccc.jpg')
    if image_content is None:
        sys.exit()

    # 进行OCR识别
    ocr_result = perform_ocr(token, image_content)
    if ocr_result is None:
        sys.exit()
    text=''
    # 遍历识别结果，调用NLP查询
    for words_result in ocr_result.get("words_result", []):
        ab=words_result.get("words", "")
        if(ab[0]=='['or ab[0]=='【'):
            text1=text
            text=text.replace(text,ab)
        else:
            text+=ab
            continue
        #text = words_result.get("words", "")



        nlp_response = query_nlp(token, text1)
        if nlp_response:
            #print(nlp_response)
            nlp_r = json.loads(nlp_response)
            a = nlp_r.get('results_list')
            b = a[0].get('results')
            c = b[0].get('items')
            if len(c)!=0:
                print(a[0].get('content'))
                break
        time.sleep(1)
