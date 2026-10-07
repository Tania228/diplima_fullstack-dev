import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Banner from '../components/Banner';
import TextField from '../components/TextField';
import { clearAuthError, login } from '../store/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const submitting = useSelector((state) => state.auth.submitting);
  const error = useSelector((state) => state.auth.error);
  const [form, setForm] = useState({ login: '', password: '' });
  const [localError, setLocalError] = useState('');

  if (user) {
    return <Navigate to={user.is_admin ? '/admin' : '/storage'} replace />;
  }

  function update(event) {
    dispatch(clearAuthError());
    setLocalError('');
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.login.trim() || !form.password) {
      setLocalError('Укажите логин и пароль');
      return;
    }
    const result = await dispatch(login({ login: form.login.trim(), password: form.password }));
    if (login.fulfilled.match(result)) {
      navigate(result.payload.is_admin ? '/admin' : '/storage', { replace: true });
    }
  }

  return (
    <section className="card narrow">
      <h1>Вход</h1>
      <p className="muted">Введите логин и пароль. Если логина нет в системе или пароль неверный, форма покажет причину.</p>
      <Banner type="success">{localError || error ? null : location.state?.message}</Banner>
      <Banner>{localError || error}</Banner>
      <form onSubmit={handleSubmit} className="form" noValidate>
        <TextField
          id="login"
          name="login"
          label="Логин"
          value={form.login}
          onChange={update}
          autoComplete="username"
        />
        <TextField
          id="password"
          name="password"
          type="password"
          label="Пароль"
          value={form.password}
          onChange={update}
          autoComplete="current-password"
        />
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? 'Проверяем...' : 'Войти'}
        </button>
      </form>
      <p className="muted">Нет учётной записи? <Link to="/register">Регистрация</Link></p>
    </section>
  );
}
