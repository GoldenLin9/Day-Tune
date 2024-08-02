from django.shortcuts import render
import os
from django.http import HttpResponse
from google.auth.transport import requests
from google.oauth2 import id_token
import jwt


# Create your views here.

# def test(req):
#     return HttpResponse("Hello, world. You're at the goals index.")

def login(req):

    return HttpResponse("Hello, world. You're at the login index.")

def auth_receiver(req):

    token = req.POST['credential']

    try:
        user_data = id_token.verify_oauth2_token(token, req.Request(), os.getenv('GOOGLE_CLIENT_ID'))
    except ValueError:
        return HttpResponse("Invalid token")
    
    req.session['user'] = user_data
    return HttpResponse("Logged in")

def logout(req):
    del req.session['user']
    return HttpResponse("Logged out")