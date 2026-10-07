import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="card narrow">
      <h1>Страница не найдена</h1>
      <p className="muted">Проверьте адрес или вернитесь на главную.</p>
      <Link className="button button-primary" to="/">На главную</Link>
    </section>
  );
}