from rest_framework import serializers
from .models import Profile, Reminder
from django.contrib.auth.models import User

class Register(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField()  
    university = serializers.CharField() 

    def validate(self, data):
        return data

    def create(self, validated_data):
        university = validated_data.pop("university")  #
        phone_number = validated_data.pop("phone_number")  
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"]
        )
        user.set_password(validated_data["password"])
        user.save()

        # ✅ Create profile with university and phone number
        Profile.objects.create(user=user, university=university, phone_number=phone_number)

        return user  # better to return the User instance


class LoginResponseSerializer(serializers.ModelSerializer):
    university = serializers.CharField(source="profile.university")  # ✅ link to Profile
    phone_number = serializers.CharField(source="profile.phone_number")  # ✅ link to Profile

    class Meta:
        model = User
        fields = ["id", "username", "email", "university", "phone_number"]


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model=Reminder
        fields='__all__'
        read_only_fields = ['user']


        