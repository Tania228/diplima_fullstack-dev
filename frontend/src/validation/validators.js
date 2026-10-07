const LOGIN_RE = /^[A-Za-z][A-Za-z0-9]{3,19}$/;
const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

export function validateRegistration(values) {
  const errors = {};
  if (!LOGIN_RE.test(values.login || '')) {
    errors.login = 'Логин: от 4 до 20 символов, только латиница и цифры, первый символ — буква';
  }
  const fullName = (values.full_name || '').trim();
  if (!fullName || fullName.length > 150) {
    errors.full_name = 'Укажите полное имя длиной до 150 символов';
  }
  if (!EMAIL_RE.test((values.email || '').trim())) {
    errors.email = 'Укажите корректный адрес электронной почты';
  }
  if (!PASSWORD_RE.test(values.password || '')) {
    errors.password = 'Пароль: не менее 6 символов, заглавная буква, цифра и специальный символ';
  }
  return errors;
}
