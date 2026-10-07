import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { changeAdminFlag, removeUser } from '../store/usersSlice';
import { formatSize } from '../utils/format';

export default function UserTable({ users, currentUserId }) {
  const dispatch = useDispatch();
  const [busyId, setBusyId] = useState(null);

  async function toggleAdmin(user) {
    setBusyId(user.id);
    await dispatch(changeAdminFlag({ userId: user.id, isAdmin: !user.is_admin }));
    setBusyId(null);
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(`Удалить пользователя ${user.login} и все его файлы?`);
    if (!confirmed) {
      return;
    }
    setBusyId(user.id);
    await dispatch(removeUser(user.id));
    setBusyId(null);
  }

  if (!users.length) {
    return <p className="muted">Пользователей нет.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Логин</th>
            <th>Полное имя</th>
            <th>Email</th>
            <th>Администратор</th>
            <th>Файлов</th>
            <th>Размер</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id}>
                <td>{user.login}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.is_admin ? 'Да' : 'Нет'}</td>
                <td>{user.files_count}</td>
                <td>{formatSize(user.files_size)}</td>
                <td className="row-actions">
                  <Link to={`/storage/${user.id}`} title="Открыть файловое хранилище этого пользователя">
                    Хранилище
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === user.id || isSelf}
                    title={isSelf ? 'Нельзя изменить собственные права' : 'Изменить признак администратора'}
                    onClick={() => toggleAdmin(user)}
                  >
                    {user.is_admin ? 'Снять права' : 'Сделать администратором'}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    disabled={busyId === user.id || isSelf}
                    title={isSelf ? 'Нельзя удалить свою учётную запись' : 'Удалить пользователя и его файлы'}
                    onClick={() => handleDelete(user)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
