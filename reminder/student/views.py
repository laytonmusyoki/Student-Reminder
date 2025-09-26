from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import *
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login,logout

# Create your views here.

@api_view(['POST'])
def register(request):
    if request.method == 'POST':
        print(request.data)
        serializer = Register(data=request.data)
        
        username = request.data.get('username')
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=request.data.get('email')).exists():
            return Response({"error": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response({"success": "User created successfully"}, status=status.HTTP_201_CREATED)
            except IntegrityError:
                return Response({"error": "An error occurred while creating the user."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def signin(request):
    username = request.data.get('username')
    password = request.data.get('password')
    print(username, password)

    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        refresh = RefreshToken.for_user(user)

        # ✅ Use serializer that includes profile.university
        serializer = LoginResponseSerializer(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": serializer.data
        }, status=status.HTTP_200_OK)

    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)    




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addReminder(request):
    if request.method == 'POST':
        serializer=ReminderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"success":"Reminder added successfully"},status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getReminders(request):
    reminders = Reminder.objects.filter(user=request.user)
    serializer = ReminderSerializer(reminders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteReminder(request, reminder_id):
    try:
        reminder = Reminder.objects.get(id=reminder_id, user=request.user)
    except Reminder.DoesNotExist:
        return Response({"error": "Reminder not found"}, status=status.HTTP_404_NOT_FOUND)

    reminder.delete()
    return Response({"success": "Reminder deleted successfully"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def users(request):
    users = User.objects.all()
    user_data = [{"id": user.id, "username": user.username, "email": user.email} for user in users]
    return Response(user_data, status=status.HTTP_200_OK)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def signout(request):
    # logout(request)
    return Response({"success":"You have logged out successfully"})
