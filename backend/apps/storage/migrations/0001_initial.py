import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='StoredFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('original_name', models.CharField(max_length=255, verbose_name='оригинальное имя')),
                ('size', models.BigIntegerField(verbose_name='размер')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True, verbose_name='дата загрузки')),
                ('last_downloaded_at', models.DateTimeField(blank=True, null=True, verbose_name='последнее скачивание')),
                ('comment', models.TextField(blank=True, default='', verbose_name='комментарий')),
                ('storage_path', models.CharField(max_length=255, verbose_name='путь к файлу')),
                ('public_link', models.CharField(max_length=128, unique=True, verbose_name='специальная ссылка')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to=settings.AUTH_USER_MODEL, verbose_name='владелец')),
            ],
            options={
                'verbose_name': 'файл',
                'verbose_name_plural': 'файлы',
                'ordering': ['-uploaded_at'],
            },
        ),
    ]
