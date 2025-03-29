import sys
import json
import base64
import requests
import time
from PIL import Image
from urllib.request import urlopen, Request
from urllib.error import URLError
from urllib.parse import urlencode, quote_plus
from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
import ssl

import asyncio
import io
import edge_tts



ssl._create_default_https_context = ssl._create_unverified_context

API_KEY = '1aivsZ8CFjykCtCk5w4Xea7M'
SECRET_KEY = 'MCUxYP73OzCUGM5yBp1QhTyY1l6QYHhh'
OCR_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic"
TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token'
NLP_URL = "https://aip.baidubce.com/rpc/2.0/nlp/v1/txt_monet"

# 保证兼容python2以及python3
IS_PY3 = sys.version_info.major == 3

def get_token():
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
    try:
        with open(image_path, 'rb') as f:
            return f.read()
    except Exception as e:
        print(f"读取图片文件时出现错误: {e}")
        return None

def perform_ocr(token, image_content):
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
        encoding = response.encoding if response.encoding else 'utf-8'
        return response.content.decode(encoding)
    except requests.RequestException as e:
        print(f"NLP查询时出现错误: {e}")
        return None

@csrf_exempt
def process_image(request):
    if request.method == 'POST':
        try:
            # Check if the request contains a file
            if 'image' not in request.FILES:
                return JsonResponse({"error": "No image file provided"}, status=400)

                # Read the uploaded image file
            image_file = request.FILES['image']
            img = Image.open(image_file)
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                img = img.convert('RGB')
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            image_content = img_byte_arr.getvalue()

            # Get Baidu AI token
            token = get_token()
            if isinstance(token, JsonResponse):  # If token retrieval failed
                return token

            # Perform OCR on the image
            ocr_result = perform_ocr(token, image_content)
            if ocr_result is None:
                return JsonResponse({"error": "OCR recognition failed"}, status=500)

            # Extract text from OCR result
            text = ''
            textall=[]
            final_result = None
            for words_result in ocr_result.get("words_result", []):
                ab = words_result.get("words", "")
                if ab and (ab[0] == '[' or ab[0] == '【'):

                    text1 = text
                    text = ab
                else:
                    text += ab
                    continue

                # Query NLP for "用法用量"
                nlp_response = query_nlp(token, text1)
                if nlp_response:
                    nlp_r = json.loads(nlp_response)
                    a = nlp_r.get('results_list')
                    if a:
                        b = a[0].get('results')
                        k = a[0].get('content')
                        textall.append(k)
                        if b:
                            c = b[0].get('items')
                            if c:
                                final_result = a[0].get('content')
                                #break
                time.sleep(1)
            nlp_response = query_nlp(token, text)
            if nlp_response:
                nlp_r = json.loads(nlp_response)
                a = nlp_r.get('results_list')
                if a:
                    b = a[0].get('results')
                    k = a[0].get('content')
                    textall.append(k)
                    if b:
                        c = b[0].get('items')
                        if c:
                            final_result = a[0].get('content')
            # Return the final result
            if final_result:
                return JsonResponse({"result": final_result,"all_content":textall},status=200)
            else:
                return JsonResponse({"result": "No relevant information found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

#语音转文字
async def text_to_speech_async(text):
    communicate = edge_tts.Communicate(text, "zh-CN-XiaoxiaoNeural")
    audio_file = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_file.write(chunk["data"])
    audio_file.seek(0)
    return audio_file

@csrf_exempt
def text_to_speech(request):
    if request.method == 'POST':
        try:
            # 解析 JSON 数据
            data = json.loads(request.body.decode('utf-8'))
            text = data.get('text')
            if text:
                try:
                    # 进行文字转语音
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    audio_file = loop.run_until_complete(text_to_speech_async(text))
                    loop.close()

                    response = HttpResponse(audio_file, content_type='audio/mpeg', status=200)
                    response['Content-Disposition'] = 'attachment; filename=speech.mp3'
                    return response
                except Exception as e:
                    return JsonResponse({"error": f"转换语音时出错: {str(e)}"}, status=500)
        except json.JSONDecodeError:
            return JsonResponse({"error": "无效的 JSON 格式"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "无效的请求方法"}, status=405)
