export function formatCount(count) {
  const value = Number(count) || 0;
  const mod10 = value % 10;
  const mod100 = value % 100;
  let word = 'файлов';
  if (mod10 === 1 && mod100 !== 11) {
    word = 'файл';
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    word = 'файла';
  }
  return `${value} ${word}`;
}

export function formatSize(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) {
    return `${value} Б`;
  }
  const units = ['КБ', 'МБ', 'ГБ'];
  let size = value / 1024;
  let unit = units[0];
  for (let index = 0; index < units.length; index += 1) {
    unit = units[index];
    if (size < 1024 || index === units.length - 1) {
      break;
    }
    size /= 1024;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${unit}`;
}

export function formatDate(value) {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
