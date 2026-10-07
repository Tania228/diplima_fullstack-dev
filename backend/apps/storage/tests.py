import json
from pathlib import Path
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase, override_settings

from apps.storage.models import StoredFile
from apps.users.models import User


class StorageApiTests(TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.settings = override_settings(STORAGE_ROOT=Path(self.directory.name))
        self.settings.enable()
        self.client = Client()
        self.owner = User.objects.create_user('ivan', 'ivan@example.com', 'Secret1!', 'Иван Иванов')
        self.other = User.objects.create_user('petr', 'petr@example.com', 'Secret1!', 'Пётр Петров')
        self.client.post(
            '/api/auth/login/',
            data=json.dumps({'login': 'ivan', 'password': 'Secret1!'}),
            content_type='application/json',
        )

    def tearDown(self):
        self.settings.disable()
        self.directory.cleanup()

    def upload(self, name='note.txt', content=b'hello', comment='черновик'):
        return self.client.post(
            '/api/files/upload/',
            {'comment': comment, 'file': SimpleUploadedFile(name, content)},
        )

    def test_file_lifecycle_and_public_link(self):
        created = self.upload()
        self.assertEqual(created.status_code, 201)
        stored = StoredFile.objects.get(pk=created.json()['id'])
        self.assertNotIn('ivan', stored.public_link)
        self.assertNotIn('note', stored.public_link)
        self.assertTrue((Path(self.directory.name) / stored.storage_path).is_file())

        listing = self.client.get('/api/files/')
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.json()['files_count'], 1)

        renamed = self.client.patch(
            f'/api/files/{stored.id}/rename/',
            data=json.dumps({'name': 'letter.txt'}),
            content_type='application/json',
        )
        self.assertEqual(renamed.status_code, 200)
        self.assertEqual(renamed.json()['original_name'], 'letter.txt')

        commented = self.client.patch(
            f'/api/files/{stored.id}/comment/',
            data=json.dumps({'comment': 'итог'}),
            content_type='application/json',
        )
        self.assertEqual(commented.json()['comment'], 'итог')

        link = self.client.get(f'/api/files/{stored.id}/link/')
        self.assertEqual(link.status_code, 200)
        self.assertTrue(link.json()['url'].endswith(stored.public_link))

        downloaded = self.client.get(f'/api/files/{stored.id}/download/')
        self.assertEqual(downloaded.status_code, 200)
        self.assertIn('attachment', downloaded['Content-Disposition'])
        self.assertIn('letter.txt', downloaded['Content-Disposition'])
        self.assertEqual(b''.join(downloaded.streaming_content), b'hello')

        self.client.logout()
        public = self.client.get(stored.public_link)
        self.assertEqual(public.status_code, 200)
        self.assertIn('letter.txt', public['Content-Disposition'])
        self.assertEqual(b''.join(public.streaming_content), b'hello')

        self.client.post(
            '/api/auth/login/',
            data=json.dumps({'login': 'ivan', 'password': 'Secret1!'}),
            content_type='application/json',
        )
        removed = self.client.delete(f'/api/files/{stored.id}/')
        self.assertEqual(removed.status_code, 200)
        self.assertFalse((Path(self.directory.name) / stored.storage_path).exists())

    def test_regular_user_cannot_open_foreign_storage(self):
        foreign = self.client.get(f'/api/files/?user_id={self.other.id}')
        self.assertEqual(foreign.status_code, 403)
        created = self.upload()
        file_id = created.json()['id']
        self.client.post(
            '/api/auth/login/',
            data=json.dumps({'login': 'petr', 'password': 'Secret1!'}),
            content_type='application/json',
        )
        denied = self.client.get(f'/api/files/{file_id}/download/')
        self.assertEqual(denied.status_code, 403)

    def test_admin_opens_another_storage(self):
        created = self.upload()
        self.client.post(
            '/api/auth/login/',
            data=json.dumps({'login': 'admin', 'password': 'Admin123!'}),
            content_type='application/json',
        )
        listing = self.client.get(f'/api/files/?user_id={self.owner.id}')
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.json()['files'][0]['id'], created.json()['id'])
