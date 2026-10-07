import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getLink } from '../api/filesApi';
import { changeComment, removeFile, renameFile } from '../store/filesSlice';
import { formatDate, formatSize } from '../utils/format';

export default function FileTable({ files }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);

  function startEdit(file, mode) {
    setNotice('');
    setEditing({ id: file.id, mode });
    setDraft(mode === 'name' ? file.original_name : file.comment);
  }

  async function saveEdit(file) {
    setBusyId(file.id);
    const action = editing.mode === 'name'
      ? renameFile({ fileId: file.id, name: draft })
      : changeComment({ fileId: file.id, comment: draft });
    const result = await dispatch(action);
    setBusyId(null);
    if (result.meta.requestStatus === 'fulfilled') {
      setEditing(null);
      setNotice(editing.mode === 'name' ? 'Имя сохранено' : 'Комментарий сохранён');
    }
  }

  async function handleDelete(file) {
    const confirmed = window.confirm(`Удалить файл «${file.original_name}»?`);
    if (!confirmed) {
      return;
    }
    setBusyId(file.id);
    await dispatch(removeFile(file.id));
    setBusyId(null);
  }

  async function copyLink(file) {
    setNotice('');
    const result = await getLink(file.id);
    if (!result.ok) {
      setNotice(result.data?.detail || 'Не удалось получить ссылку');
      return;
    }
    try {
      await navigator.clipboard.writeText(result.data.url);
      setNotice('Ссылка скопирована. Её можно открыть без входа в систему.');
    } catch {
      window.prompt('Скопируйте ссылку', result.data.url);
    }
  }

  if (!files.length) {
    return <p className="muted">В хранилище пока нет файлов.</p>;
  }

  return (
    <>
      {notice ? <p className="notice">{notice}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Комментарий</th>
              <th>Размер</th>
              <th>Загружен</th>
              <th>Последнее скачивание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td>
                  {editing?.id === file.id && editing.mode === 'name' ? (
                    <span className="inline-edit">
                      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
                      <button type="button" disabled={busyId === file.id} onClick={() => saveEdit(file)}>Сохранить</button>
                      <button type="button" onClick={() => setEditing(null)}>Отмена</button>
                    </span>
                  ) : file.original_name}
                </td>
                <td>
                  {editing?.id === file.id && editing.mode === 'comment' ? (
                    <span className="inline-edit">
                      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
                      <button type="button" disabled={busyId === file.id} onClick={() => saveEdit(file)}>Сохранить</button>
                      <button type="button" onClick={() => setEditing(null)}>Отмена</button>
                    </span>
                  ) : (file.comment || '—')}
                </td>
                <td>{formatSize(file.size)}</td>
                <td>{formatDate(file.uploaded_at)}</td>
                <td>{formatDate(file.last_downloaded_at)}</td>
                <td className="row-actions">
                  <a href={`/api/files/${file.id}/download/`} title="Скачать файл на компьютер">Скачать</a>
                  <a
                    href={`/api/files/${file.id}/download/?inline=1`}
                    target="_blank"
                    rel="noreferrer"
                    title="Открыть файл в браузере"
                  >
                    Открыть
                  </a>
                  <button type="button" title="Изменить отображаемое имя файла" onClick={() => startEdit(file, 'name')}>
                    Переименовать
                  </button>
                  <button type="button" title="Изменить комментарий к файлу" onClick={() => startEdit(file, 'comment')}>
                    Комментарий
                  </button>
                  <button
                    type="button"
                    title="Скопировать обезличенную ссылку для внешнего доступа"
                    onClick={() => copyLink(file)}
                  >
                    Ссылка
                  </button>
                  <button type="button" className="danger" disabled={busyId === file.id} onClick={() => handleDelete(file)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
