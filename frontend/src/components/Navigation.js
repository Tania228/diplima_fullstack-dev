import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { clearFiles } from '../store/filesSlice';
import { clearUsers } from '../store/usersSlice';

export default function Navigation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const initialized = useSelector((state) => state.auth.initialized);

  async function handleLogout() {
    await dispatch(logout());
    dispatch(clearUsers());
    dispatch(clearFiles());
    navigate('/');
  }

  return (
    <header className="header">
      <NavLink className="brand" to="/" title="На главную">
        <span className="brand-mark" aria-hidden="true" />
        My Cloud
      </NavLink>
      <nav className="nav">
        {initialized && user ? <NavLink to="/storage">Хранилище</NavLink> : null}
        {initialized && user?.is_admin ? <NavLink to="/admin">Пользователи</NavLink> : null}
        {initialized && !user ? <NavLink to="/login">Вход</NavLink> : null}
        {initialized && !user ? <NavLink to="/register">Регистрация</NavLink> : null}
        {initialized && user ? (
          <button type="button" className="link-button" onClick={handleLogout} title="Завершить сессию">
            Выход
          </button>
        ) : null}
      </nav>
      {initialized && user ? <span className="who">{user.full_name}</span> : null}
    </header>
  );
}
