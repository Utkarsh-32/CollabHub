"""
URL configuration for collabhub project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenVerifyView
from dj_rest_auth.jwt_auth import get_refresh_view
from django.http import HttpResponseRedirect
from rest_framework_simplejwt.tokens import RefreshToken
import os

    
def github_login_redirect(request):
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    if not request.user.is_authenticated:
        return HttpResponseRedirect(f'{FRONTEND_URL}/login')
    refresh = RefreshToken.for_user(request.user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    redirect_url = f'{FRONTEND_URL}/social/github/callback/?access={access_token}&refresh={refresh_token}'
    return HttpResponseRedirect(redirect_url)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('projects.urls')),
    path('api/', include('users.urls')),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/token/refresh/', get_refresh_view().as_view(), name='token_refresh'),
    path('api/auth/github/redirect/', github_login_redirect, name="github_login_redirect"),
    path('accounts/', include('allauth.urls'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
