from django.urls import path

from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register, name='register'),
    path('signin/', signin, name='signin'),
    path('signout/',signout,name='signout'),
    path('addReminder/', addReminder, name='addReminder'),
    path('updateReminder/<int:reminder_id>/', updateReminder, name='updateReminder'),
    path('users/', users, name='users'),
    path('getReminders/', getReminders, name='getReminders'),
    path('deleteReminder/<int:reminder_id>/', deleteReminder, name='deleteReminder'),
    path('send_sms/', send_sms, name='send_sms'),
]