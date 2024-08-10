
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.urls import path, re_path
from .views import (
    CustomProviderAuthView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    CustomTokenVerifyView,
    LogoutView
)

from . import views

urlpatterns = [
    path('', include('djoser.urls')),
    path('', include('djoser.social.urls')),

    re_path(
        r'^o/(?P<provider>\S+)/$',
        CustomProviderAuthView.as_view(),
        name='provider-auth'
    ),
    
    path('jwt/create/', CustomTokenObtainPairView.as_view()),
    path('jwt/refresh/', CustomTokenRefreshView.as_view()),
    path('jwt/verify/', CustomTokenVerifyView.as_view()),
    path('logout/', LogoutView.as_view()),
    
    path('register/', views.UserView.as_view(), name='register'),
    # path('create-validation-code/', views.ValidationCodeView.as_view(), name='create-validation-code'),
    path('verify-email/', views.VerifyEmailView.as_view(), name='check-email'),
    # path('google-signin/', views.GoogleSignin.as_view(), name='google-signin'),
    path('check/', views.check, name='check'),

    # path('my-email/', views.MyEmail.as_view(), name='my-email'),
]