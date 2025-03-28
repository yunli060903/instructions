from django.urls import path
from .views import process_image,text_to_speech

urlpatterns = [
    path('process_image/', process_image, name='process_image'),
    path('tts/',text_to_speech,name='text_to_speech')
]