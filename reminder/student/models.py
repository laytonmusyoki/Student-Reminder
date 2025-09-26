from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser

# Create your models here.


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    university = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.university
    

# reminder
class Reminder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reminder_type = models.CharField(max_length=255)
    due_date = models.CharField(max_length=255)
    due_time = models.CharField(max_length=255)

    def __str__(self):
        return self.reminder_type