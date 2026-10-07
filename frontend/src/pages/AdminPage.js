import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Banner from '../components/Banner';
import UserTable from '../components/UserTable';
import { fetchUsers } from '../store/usersSlice';

export default function AdminPage() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const { items, status, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <section className="card">
      <h1>Пользователи</h1>
      <p className="muted">
        Список учётных записей, признак администратора и сводка по хранилищу. Пароли не отображаются.
      </p>
      <Banner>{error}</Banner>
      {status === 'loading' && !items.length ? (
        <p className="muted">Загрузка списка...</p>
      ) : (
        <UserTable users={items} currentUserId={currentUser?.id} />
      )}
    </section>
  );
}
