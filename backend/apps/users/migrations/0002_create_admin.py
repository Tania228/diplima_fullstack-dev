from django.contrib.auth.hashers import make_password
from django.db import migrations


def create_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    if User.objects.filter(login='admin').exists():
        return
    User.objects.create(
        login='admin',
        full_name='Администратор',
        email='admin@mycloud.local',
        password=make_password('Admin123!'),
        is_admin=True,
        storage_path='admin',
    )


def remove_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(login='admin').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_admin, remove_admin),
    ]
