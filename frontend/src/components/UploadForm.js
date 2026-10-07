import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { uploadFile } from '../store/filesSlice';

export default function UploadForm({ userId }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError('Выберите файл');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await dispatch(uploadFile({ file, comment, userId }));
    setSubmitting(false);
    if (uploadFile.fulfilled.match(result)) {
      setFile(null);
      setComment('');
      event.target.reset();
      return;
    }
    setError(result.payload || 'Не удалось загрузить файл');
  }

  return (
    <form className="upload" onSubmit={handleSubmit}>
      <div className="field">
        <span>Новый файл</span>
        <label className="file-picker">
          <input
            type="file"
            onChange={(event) => {
              setError('');
              setFile(event.target.files?.[0] || null);
            }}
          />
          <span>{file ? file.name : 'Выбрать файл'}</span>
        </label>
      </div>
      <label className="field">
        <span>Комментарий</span>
        <input
          type="text"
          value={comment}
          maxLength={1000}
          placeholder="Необязательно"
          onChange={(event) => setComment(event.target.value)}
        />
      </label>
      {error ? <small className="field-error">{error}</small> : null}
      <button className="button button-primary" type="submit" disabled={submitting} title="Сохранить файл в хранилище">
        {submitting ? 'Загрузка...' : 'Загрузить'}
      </button>
    </form>
  );
}
