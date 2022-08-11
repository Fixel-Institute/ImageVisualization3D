from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, User
from django.utils import timezone
import uuid
import json
import datetime

# Create your models here.
class PlatformUserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError("Email must exist")
        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.save()
        return user

class PlatformUser(AbstractBaseUser):
    email = models.EmailField(verbose_name="Email Address", max_length=255, unique=True)
    uniqueUserID = models.UUIDField(default=uuid.uuid1, unique=True, editable=False)
    register_date = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"

    objects = PlatformUserManager()

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.email

    @property
    def is_staff(self):
        return self.is_admin