import re


LOGIN_RE = re.compile(r'^[A-Za-z][A-Za-z0-9]{3,19}$')
EMAIL_RE = re.compile(r'^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$')
PASSWORD_RE = re.compile(r'^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$')


def validate_registration(payload):
    errors = {}
    login = payload.get('login', '')
    full_name = payload.get('full_name', '')
    email = payload.get('email', '')
    password = payload.get('password', '')

    if not isinstance(login, str) or LOGIN_RE.fullmatch(login) is None:
        errors['login'] = 'Логин: от 4 до 20 символов, только латиница и цифры, первый символ — буква'
    if not isinstance(full_name, str) or not full_name.strip() or len(full_name.strip()) > 150:
        errors['full_name'] = 'Укажите полное имя длиной до 150 символов'
    if not isinstance(email, str) or EMAIL_RE.fullmatch(email.strip()) is None:
        errors['email'] = 'Укажите корректный адрес электронной почты'
    if not isinstance(password, str) or PASSWORD_RE.fullmatch(password) is None:
        errors['password'] = 'Пароль: не менее 6 символов, заглавная буква, цифра и специальный символ'
    return errors
