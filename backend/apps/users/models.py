from django.contrib.auth.base_user import AbstractBaseUser
from django.db import models

from apps.users.managers import UserManager


class User(AbstractBaseUser):
    login = models.CharField('логин', max_length=20, unique=True)
    full_name = models.CharField('полное имя', max_length=150)
    email = models.EmailField('электронная почта', unique=True)
    is_admin = models.BooleanField('администратор', default=False)
    storage_path = models.CharField('путь к хранилищу', max_length=64, unique=True)

    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = ['email', 'full_name']

    objects = UserManager()

    class Meta:
        verbose_name = 'пользователь'
        verbose_name_plural = 'пользователи'
        ordering = ['login']

    def __str__(self):
        return self.login
