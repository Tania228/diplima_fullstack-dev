import json

from django.test import Client, TestCase

from apps.users.models import User


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_register_rejects_invalid_fields(self):
        response = self.client.post(
            '/api/auth/register/',
            data=json.dumps({
                'login': '1bad',
                'full_name': '',
                'email': 'not-email',
                'password': 'weak',
            }),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 400)
        errors = response.json()['errors']
        self.assertIn('login', errors)
        self.assertIn('email', errors)
        self.assertIn('password', errors)
        self.assertIn('full_name', errors)

    def test_register_login_and_logout(self):
        payload = {
            'login': 'ivan',
            'full_name': 'Иван Иванов',
            'email': 'ivan@example.com',
            'password': 'Secret1!',
        }
        created = self.client.post('/api/auth/register/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(created.status_code, 201)
        self.assertNotIn('password', created.json())

        missing = self.client.post(
            '/api/auth/login/',
            data=json.dumps({'login': 'nobody', 'password': 'Secret1!'}),
            content_type='application/json',
        )
        self.assertEqual(missing.status_code, 401)
        self.assertIn('не найден', missing.json()['detail'])

        wrong = self.client.post(
            '/api/auth/login/',
            data=json.dumps({'login': 'ivan', 'password': 'Secret2!'}),
            content_type='application/json',
        )
        self.assertEqual(wrong.status_code, 401)
        self.assertIn('пароль', wrong.json()['detail'])

        logged = self.client.post(
            '/api/auth/login/',
            data=json.dumps({'login': 'ivan', 'password': 'Secret1!'}),
            content_type='application/json',
        )
        self.assertEqual(logged.status_code, 200)
        me = self.client.get('/api/auth/me/')
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()['login'], 'ivan')
        self.assertFalse(me.json()['is_admin'])

        forbidden = self.client.get('/api/users/')
        self.assertEqual(forbidden.status_code, 403)

        left = self.client.post('/api/auth/logout/')
        self.assertEqual(left.status_code, 200)
        self.assertEqual(self.client.get('/api/auth/me/').status_code, 401)

    def test_admin_created_by_migration(self):
        admin = User.objects.get(login='admin')
        self.assertTrue(admin.is_admin)
        self.assertTrue(admin.check_password('Admin123!'))

    def test_admin_manages_users(self):
        self.client.post(
            '/api/auth/login/',
            data=json.dumps({'login': 'admin', 'password': 'Admin123!'}),
            content_type='application/json',
        )
        User.objects.create_user('petr', 'petr@example.com', 'Secret1!', 'Пётр Петров')
        listing = self.client.get('/api/users/')
        self.assertEqual(listing.status_code, 200)
        petr = next(item for item in listing.json() if item['login'] == 'petr')
        self.assertIn('files_count', petr)
        self.assertNotIn('password', petr)

        promoted = self.client.patch(
            f"/api/users/{petr['id']}/",
            data=json.dumps({'is_admin': True}),
            content_type='application/json',
        )
        self.assertEqual(promoted.status_code, 200)
        self.assertTrue(promoted.json()['is_admin'])

        removed = self.client.delete(f"/api/users/{petr['id']}/")
        self.assertEqual(removed.status_code, 200)
        self.assertFalse(User.objects.filter(login='petr').exists())
