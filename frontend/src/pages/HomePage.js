import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <section className="hero card">
      <p className="eyebrow">Облачное хранилище</p>
      <h1>My Cloud</h1>
      <p className="lead">
        Сервис для личных файлов: загрузка, скачивание, переименование, комментарии и отдельная ссылка,
        по которой файл можно открыть без входа в систему.
      </p>
      <ul className="features">
        <li>Регистрация с проверкой логина, почты и пароля.</li>
        <li>У каждого пользователя своё хранилище.</li>
        <li>Администратор видит пользователей и может открыть любое хранилище.</li>
      </ul>
      <div className="actions">
        {user ? (
          <Link className="button button-primary" to={user.is_admin ? '/admin' : '/storage'}>
            Перейти в приложение
          </Link>
        ) : (
          <>
            <Link className="button button-primary" to="/register">Регистрация</Link>
            <Link className="button button-ghost" to="/login">Вход</Link>
          </>
        )}
      </div>
    </section>
  );
}
