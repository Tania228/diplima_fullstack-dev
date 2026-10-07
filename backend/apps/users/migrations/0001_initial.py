import apps.users.managers
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('login', models.CharField(max_length=20, unique=True, verbose_name='логин')),
                ('full_name', models.CharField(max_length=150, verbose_name='полное имя')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='электронная почта')),
                ('is_admin', models.BooleanField(default=False, verbose_name='администратор')),
                ('storage_path', models.CharField(max_length=64, unique=True, verbose_name='путь к хранилищу')),
            ],
            options={
                'verbose_name': 'пользователь',
                'verbose_name_plural': 'пользователи',
                'ordering': ['login'],
            },
            managers=[
                ('objects', apps.users.managers.UserManager()),
            ],
        ),
    ]
