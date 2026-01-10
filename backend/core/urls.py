from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # මෙතන කෙලින්ම game urls වලට යොමු කරන්න. 
    # views import කරන්න එපා.
    path('', include('game.urls')), 
]