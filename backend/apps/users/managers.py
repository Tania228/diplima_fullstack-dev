import uuid

from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, login, email, password, full_name, is_admin=False, storage_path=None):
        if not login:
            raise ValueError('Нужно указать логин')
        if not email:
            raise ValueError('Нужно указать email')
        if not storage_path:
            storage_path = uuid.uuid4().hex
        user = self.model(
            login=login,
            email=self.normalize_email(email.strip().lower()),
            full_name=full_name.strip(),
            is_admin=is_admin,
            storage_path=storage_path,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
