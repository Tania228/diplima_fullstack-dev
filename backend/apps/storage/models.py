from django.conf import settings
from django.db import models


class StoredFile(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='files',
        verbose_name='владелец',
    )
    original_name = models.CharField('оригинальное имя', max_length=255)
    size = models.BigIntegerField('размер')
    uploaded_at = models.DateTimeField('дата загрузки', auto_now_add=True)
    last_downloaded_at = models.DateTimeField('последнее скачивание', null=True, blank=True)
    comment = models.TextField('комментарий', blank=True, default='')
    storage_path = models.CharField('путь к файлу', max_length=255)
    public_link = models.CharField('специальная ссылка', max_length=128, unique=True)

    class Meta:
        verbose_name = 'файл'
        verbose_name_plural = 'файлы'
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.original_name
