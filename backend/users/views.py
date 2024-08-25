from django.shortcuts import render
import os
from django.http import HttpResponse
import jwt

from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ValidationCode, User

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from djoser.social.views import ProviderAuthView

from django.shortcuts import get_object_or_404
from django.conf import settings
import time

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import permissions
from .authentication import CustomJWTAuthentication


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from django.http import JsonResponse


# testing out the custom authentication: works
# class MyEmail(APIView):

#     authentication_classes = [CustomJWTAuthentication]
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         return Response({'email': user.email}, status=status.HTTP_200_OK)


def check(request):
    # Print the state and code parameters to the console for debugging
    print("CHECKING STATE AND CODE")
    print(request)
    state = request.GET.get('state')
    code = request.GET.get('code')

    refresh = request.COOKIES.get('refresh')
    access = request.COOKIES.get('access')
    print("Refresh: ", refresh)
    print("Access: ", access)
    print("COOKIES: ", request.COOKIES)
    
    print("State: ", state)
    print("Code: ", code)
    
    # Return a JSON response with a 400 status code for debugging purposes
    return JsonResponse({'message': 'debugging'}, status=200)

class CustomProviderAuthView(ProviderAuthView):

    def post(self, request, *args, **kwargs):
        
        response = super().post(request, *args, **kwargs)

        if response.status_code == 201:
            access_token = response.data['access']
            refresh_token = response.data['refresh']

            response.set_cookie(
                'access',
                access_token,
                max_age=settings.AUTH_COOKIE_ACCESS_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )

            response.set_cookie(
                'refresh',
                refresh_token,
                max_age=settings.AUTH_COOKIE_REFRESH_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )

            return response

# Create your views here.
class CustomTokenObtainPairView(TokenObtainPairView):
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data['access']
            refresh_token = response.data['refresh']

            response.set_cookie(
                'access',
                access_token,
                max_age=settings.AUTH_COOKIE_ACCESS_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )

            response.set_cookie(
                'refresh',
                refresh_token,
                max_age=settings.AUTH_COOKIE_REFRESH_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )
            return response

class CustomTokenRefreshView(TokenRefreshView):
    
        def post(self, request, *args, **kwargs):
            refresh_token = request.COOKIES.get('refresh')

            if refresh_token:
                request.data['refresh'] = refresh_token
            
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                access_token = response.data['access']

                response.set_cookie(
                    'access',
                    access_token,
                    max_age=settings.AUTH_COOKIE_ACCESS_MAX_AGE,
                    path=settings.AUTH_COOKIE_PATH,
                    secure=settings.AUTH_COOKIE_SECURE,
                    httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                    samesite=settings.AUTH_COOKIE_SAMESITE
                )

            return response
        
class CustomTokenVerifyView(TokenVerifyView):
    
    def post(self, request, *args, **kwargs):
        access_token = request.COOKIES.get('access')

        if access_token:
            request.data['token'] = access_token

        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
    
    def post(self, request, *args, **kwargs):
        response = Response(status = status.HTTP_204_NO_CONTENT)

        response.delete_cookie('access')
        response.delete_cookie('refresh')

        return response


class UserView(APIView):

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        print(serializer)
        if serializer.is_valid():
            user = serializer.save()

            return Response({'id': user.id}, status=status.HTTP_201_CREATED)
        
        if serializer.errors.get('email'):
            return Response({'message': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        elif serializer.errors.get('username'):
            return Response({'message': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):

    def post(self, request):
        userId = request.data['userId']
        code = request.data['code']

        print("USER ID: ", userId)
        print("CODE: ", code)

        user = User.objects.get(pk=userId)
        print(user)
        validation_codes = ValidationCode.objects.filter(user=user)


        for validation_code in validation_codes:
            print(validation_code)
            print(validation_code.code, code)
            if validation_code.code == code and validation_code.is_expired():
                validation_code.delete()
                return Response({'message': 'Code expired'}, status=status.HTTP_400_BAD_REQUEST)
            
            elif validation_code.code == code and not validation_code.is_expired():
                validation_code.delete()
                user.is_active = True
                user.save()

                return Response({'message': 'Email verified'}, status=status.HTTP_200_OK)
        
        return Response({'message': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)