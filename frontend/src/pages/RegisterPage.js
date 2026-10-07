import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi';
import Banner from '../components/Banner';
import TextField from '../components/TextField';
import { validateRegistration } from '../validation/validators';

const empty = { login: '', full_name: '', email: '', password: '' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.is_admin ? '/admin' : '/storage'} replace />;
  }

  function update(event) {
    setDetail('');
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegistration(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setDetail('Исправьте поля и отправьте форму ещё раз');
      return;
    }
    setSubmitting(true);
    const result = await register({
      login: form.login,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      password: form.password,
    });
    setSubmitting(false);
    if (!result.ok) {
      setErrors(result.data?.errors || {});
      setDetail(result.data?.detail || 'Не удалось зарегистрироваться');
      return;
    }
    navigate('/login', { state: { message: 'Регистрация завершена. Теперь можно войти.' } });
  }

  return (
    <section className="card narrow">
      <h1>Регистрация</h1>
      <p className="muted">Минимальный набор данных: логин, полное имя, email и пароль.</p>
      <Banner>{detail}</Banner>
      <form onSubmit={handleSubmit} className="form" noValidate>
        <TextField
          id="login"
          name="login"
          label="Логин"
          hint="Латиница и цифры, первый символ — буква, от 4 до 20 символов"
          error={errors.login}
          value={form.login}
          onChange={update}
          autoComplete="username"
        />
        <TextField
          id="full_name"
          name="full_name"
          label="Полное имя"
          error={errors.full_name}
          value={form.full_name}
          onChange={update}
          autoComplete="name"
        />
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email"
          error={errors.email}
          value={form.email}
          onChange={update}
          autoComplete="email"
        />
        <TextField
          id="password"
          name="password"
          type="password"
          label="Пароль"
          hint="Не менее 6 символов: заглавная буква, цифра и специальный символ"
          error={errors.password}
          value={form.password}
          onChange={update}
          autoComplete="new-password"
        />
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? 'Отправляем...' : 'Создать учётную запись'}
        </button>
      </form>
      <p className="muted">Уже есть учётная запись? <Link to="/login">Вход</Link></p>
    </section>
  );
}
