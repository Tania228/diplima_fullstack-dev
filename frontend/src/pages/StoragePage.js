import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Banner from '../components/Banner';
import FileTable from '../components/FileTable';
import UploadForm from '../components/UploadForm';
import { fetchFiles } from '../store/filesSlice';
import { formatCount, formatSize } from '../utils/format';

export default function StoragePage() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const storage = useSelector((state) => state.files);
  const foreignForbidden = Boolean(
    userId && currentUser && !currentUser.is_admin && String(currentUser.id) !== String(userId),
  );

  useEffect(() => {
    if (!currentUser || foreignForbidden) {
      return;
    }
    dispatch(fetchFiles(userId || null));
  }, [dispatch, currentUser, userId, foreignForbidden]);

  if (foreignForbidden) {
    return (
      <section className="card">
        <h1>Хранилище</h1>
        <Banner>Доступно только своё хранилище.</Banner>
      </section>
    );
  }

  const owner = storage.owner;
  const title = owner ? `Хранилище: ${owner.full_name} (${owner.login})` : 'Хранилище';

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">
            {formatCount(storage.filesCount)}, общий размер {formatSize(storage.filesSize)}.
            Специальная ссылка не содержит логин и исходное имя файла.
          </p>
        </div>
      </div>
      <Banner>{storage.error}</Banner>
      <UploadForm userId={userId || null} />
      {storage.status === 'loading' && !storage.items.length ? (
        <p className="muted">Загрузка списка...</p>
      ) : (
        <FileTable files={storage.items} />
      )}
    </section>
  );
}
