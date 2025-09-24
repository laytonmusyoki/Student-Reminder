from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User




class Register(serializers.Serializer):
    username=serializers.CharField()
    email=serializers.EmailField()
    password=serializers.CharField()
    

    

    def validate(self,data):
        return data

    def create(self,validated_data):
        user=User.objects.create(username=validated_data['username'],email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        Profile.objects.create(user=user, university=validated_data['university'])
        return validated_data


