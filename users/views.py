from django.shortcuts import render
from django.http import HttpResponse
from users.models import User
from users.serializers import UserSerializer
from rest_framework import generics
# Create your views here.

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer