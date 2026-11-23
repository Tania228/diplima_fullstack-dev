# My Cloud

Веб-приложение «облачное хранилище». Пользователь регистрируется, входит в систему и работает со своими файлами: загружает, скачивает, открывает в браузере, переименовывает, комментирует и копирует специальную ссылку. Администратор видит список пользователей, меняет признак «администратор», удаляет учётные записи и открывает любое хранилище.

Бэкенд и фронтенд разделены по каталогам. В рабочей системе их отдаёт один сервер Django: и страницы, и `/api/`.

## Стек

- Python 3.10+ и Django 5.2
- PostgreSQL 16
- JavaScript, React 18, Redux Toolkit, React Router 6
- Webpack 5 и Babel
- Сессии Django для аутентификации, обмен данными в JSON

## Структура

```
fullstack_diploma/
  README.md                  эта инструкция
  docker-compose.yml         необязательный PostgreSQL для локального запуска
  .env.example               пример переменных окружения
  deploy/
    nginx.conf.example       пример сайта nginx
    mycloud.service.example  пример службы systemd
  backend/
    manage.py
    requirements.txt
    config/
      app_config.py          параметры БД, хранилища и окружения
      settings.py            настройки Django
      urls.py                маршруты API и страница приложения
      middleware.py          журнал HTTP-запросов
      logging_format.py      формат сообщений в консоли
      views.py               отдача страницы SPA
    apps/users/              пользователи, регистрация, вход, администрирование
    apps/storage/            файлы и публичные ссылки
    apps/common/             общие ответы API и проверка прав
    templates/index.html     оболочка страницы
    static/app/              сюда Webpack кладёт bundle.js и main.css
    media/storage/           файлы пользователей на диске
  frontend/
    package.json
    webpack.config.js
    src/api/                 запросы к API
    src/store/               состояние Redux
    src/components/          общие части интерфейса
    src/pages/               страницы
    src/validation/          проверки формы регистрации
    src/styles/main.css
```

Пароль в базе хранится только в виде хеша Django (PBKDF2), не открытым текстом. Поле модели называется `password`.

Файлы на диске лежат в каталоге пользователя под случайным именем. Исходное имя остаётся в базе и подставляется при скачивании. Специальная ссылка имеет вид `/api/public/<случайный_токен>/` и не содержит логин, путь хранилища и исходное имя.

## Что нужно установить

- Python 3.10 или новее: https://www.python.org/downloads/
- PostgreSQL 14 или новее: https://www.postgresql.org/download/
- Node.js 18 или новее и npm: https://nodejs.org/
- Git: https://git-scm.com/

Необязательно, только чтобы поднять PostgreSQL одной командой:

- Docker: https://docs.docker.com/get-docker/

Библиотеки, которых не было в базовом списке инструментов задания:

- WhiteNoise, раздача статики из Django: https://whitenoise.readthedocs.io/
- Gunicorn, сервер приложения на Linux: https://docs.gunicorn.org/
- psycopg, драйвер PostgreSQL: https://www.psycopg.org/psycopg3/docs/
- Redux Toolkit: https://redux-toolkit.js.org/
- React Router: https://reactrouter.com/
- Babel: https://babeljs.io/docs/

## Локальный запуск

Команды ниже даны для корня репозитория. На Windows в PowerShell активировать окружение не обязательно: можно вызывать `backend\.venv\Scripts\python.exe`.

### 1. База данных

Вариант через Docker:

```bash
docker compose up -d
```

Будут созданы база `mycloud`, пользователь `mycloud` и пароль `mycloud` на порту `5432`.

Вариант без Docker, в уже установленном PostgreSQL:

```sql
CREATE USER mycloud WITH PASSWORD 'mycloud';
CREATE DATABASE mycloud OWNER mycloud;
```

Саму базу создаёт администратор PostgreSQL. Миграции Django создают таблицы и учётную запись `admin`.

### 2. Бэкенд

```bash
cd backend
python -m venv .venv
```

Linux и macOS:

```bash
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
```

Windows:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
```

### 3. Фронтенд

Из каталога `frontend`:

```bash
npm install
npm run build
```

Сборка записывает `bundle.js` и `main.css` в `backend/static/app/`. Пока сборка не выполнена, страница откроется без интерфейса.

Во время правки интерфейса можно держать сборку в режиме наблюдения:

```bash
npm run watch
```

### 4. Сервер

Из каталога `backend`, при запущенной базе:

```bash
python manage.py runserver
```

Приложение: http://127.0.0.1:8000/

Остановка Docker после работы: `docker compose stop` в корне репозитория.

## Учётная запись администратора

Её создаёт миграция `apps/users/migrations/0002_create_admin.py`.

- Логин: `admin`
- Пароль: `Admin123!`
- Email: `admin@mycloud.local`

После развёртывания пароль лучше сменить:

```bash
python manage.py shell
```

```python
from apps.users.models import User
user = User.objects.get(login='admin')
user.set_password('НовыйПароль1!')
user.save()
```

## Как пользоваться интерфейсом

- Главная страница коротко описывает сервис и ведёт на регистрацию или вход.
- В меню гостя есть «Вход» и «Регистрация». После входа вместо них появляется «Выход», а также «Хранилище». У администратора дополнительно есть «Пользователи».
- Регистрация проверяет логин, email и пароль до отправки и ещё раз на сервере. Текст ошибки остаётся у поля, данные можно исправить и отправить снова.
- Логин: 4–20 символов, латиница и цифры, первый символ — буква.
- Пароль: не короче 6 символов, есть заглавная буква, цифра и специальный символ.
- Неуспешный вход пишет, не найден ли логин или неверен пароль.
- После входа администратор попадает к списку пользователей, обычный пользователь — в своё хранилище.
- В списке пользователей видны логин, полное имя, email, признак администратора, число файлов и их размер. Пароль не показывается. Ссылка «Хранилище» открывает файлы этого пользователя.
- Свою учётную запись удалить нельзя и снять с себя права администратора тоже нельзя.
- В хранилище у файла есть скачивание, открытие в браузере, переименование, комментарий, копирование ссылки и удаление. Подсказки у кнопок появляются при наведении.
- Специальную ссылку можно открыть без входа. Сервер отдаёт файл под исходным именем, поэтому ей можно пользоваться и как адресом ресурса на странице.

## API

Все ответы об ошибках — JSON вида `{"detail": "..."}`. Ошибки полей регистрации дополнительно содержат `"errors"`.

| Метод | Адрес | Кто вызывает |
| --- | --- | --- |
| POST | `/api/auth/register/` | любой посетитель |
| POST | `/api/auth/login/` | любой посетитель |
| POST | `/api/auth/logout/` | вошедший пользователь |
| GET | `/api/auth/me/` | вошедший пользователь |
| GET | `/api/users/` | администратор |
| PATCH | `/api/users/<id>/` | администратор, тело `{"is_admin": true}` |
| DELETE | `/api/users/<id>/` | администратор |
| GET | `/api/files/?user_id=<id>` | своё хранилище или, для администратора, чужое |
| POST | `/api/files/upload/` | форма `file`, `comment`, необязательный `user_id` |
| PATCH | `/api/files/<id>/rename/` | тело `{"name": "новое-имя.txt"}` |
| PATCH | `/api/files/<id>/comment/` | тело `{"comment": "текст"}` |
| DELETE | `/api/files/<id>/` | владелец или администратор |
| GET | `/api/files/<id>/download/` | скачивание; `?inline=1` открывает в браузере |
| GET | `/api/files/<id>/link/` | специальная ссылка |
| GET | `/api/public/<token>/` | скачивание без входа |

Запросы, изменяющие данные, из браузера отправляются с заголовком `X-CSRFToken`. Токен лежит в cookie `csrftoken`, её выставляет страница приложения.

## Журнал

Сообщения пишутся в консоль процесса. Уровни в нижнем регистре: `debug`, `info`, `warning`, `error`. В строке есть дата и время.

Пример:

```
2026-10-06 18:24:01 info apps.storage.services Пользователь ivan загрузил файл note.txt в хранилище ivan
2026-10-06 18:24:01 warning config.middleware GET /api/files/3/download/ -> 403
```

## Автоматические проверки

При запущенном PostgreSQL, из каталога `backend`:

```bash
python manage.py test apps.users apps.storage
```

Django создаст и затем удалит базу `test_mycloud`. Пользователь базы должен иметь право создавать базы данных. У пользователя из `docker-compose.yml` это право есть.

## Переменные окружения

Файл-образец: `.env.example`. Если переменная не задана, используются значения для локальной разработки.

| Переменная | Назначение | По умолчанию |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | секрет Django | только для разработки |
| `DJANGO_DEBUG` | режим отладки | `true` |
| `DJANGO_ALLOWED_HOSTS` | список хостов через запятую | `localhost,127.0.0.1` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | источники для CSRF, например `https://example.ru` | пусто |
| `DJANGO_COOKIE_SECURE` | cookie только по HTTPS | `false` |
| `POSTGRES_DB` | имя базы | `mycloud` |
| `POSTGRES_USER` | пользователь базы | `mycloud` |
| `POSTGRES_PASSWORD` | пароль базы | `mycloud` |
| `POSTGRES_HOST` | хост базы | `localhost` |
| `POSTGRES_PORT` | порт базы | `5432` |
| `DATABASE_ENGINE` | движок БД: `postgresql` или `sqlite` | `postgresql` |
| `SQLITE_NAME` | путь к SQLite базе при `DATABASE_ENGINE=sqlite` | `backend/db.sqlite3` |
| `STORAGE_ROOT` | каталог файлов на диске | `backend/media/storage` |
| `MAX_UPLOAD_SIZE` | максимальный размер файла в байтах | `52428800` (50 МиБ) |

На Linux переменные можно положить в файл и передать службе через `EnvironmentFile`. Имена в файле те же, без префикса `export`.

## Развёртывание на reg.ru

Для бесплатной демонстрации есть отдельная инструкция [PythonAnywhere](deploy/pythonanywhere-free.md). Бесплатный Render не подходит для постоянного хранения файлов: его диск временный, а бесплатная PostgreSQL база удаляется через 30 дней.

Ниже порядок для виртуального сервера с Ubuntu 22.04 или 24.04. Домен в примерах — `example.ru`, каталог — `/var/www/mycloud`. Подставьте свои значения.

1. В панели reg.ru создайте VPS и привяжите домен к его IP.
2. Подключитесь по SSH и установите пакеты:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip postgresql nginx
```

Проверьте `python3 --version` (нужно 3.10+) и `node --version`. Если Node.js нет или он старше 18, поставьте актуальную ветку с https://nodejs.org/en/download .

3. Создайте базу:

```bash
sudo -u postgres psql -c "CREATE USER mycloud WITH PASSWORD 'надёжный-пароль';"
sudo -u postgres psql -c "CREATE DATABASE mycloud OWNER mycloud;"
```

4. Скопируйте проект, например:

```bash
sudo mkdir -p /var/www/mycloud
sudo chown "$USER":www-data /var/www/mycloud
git clone <адрес-репозитория> /var/www/mycloud
cd /var/www/mycloud
```

5. Соберите бэкенд и фронтенд:

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
cd frontend
npm install
npm run build
cd ..
```

6. Создайте `/var/www/mycloud/.env`:

```
DJANGO_SECRET_KEY=длинная-случайная-строка
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=example.ru
DJANGO_CSRF_TRUSTED_ORIGINS=https://example.ru
DJANGO_COOKIE_SECURE=true
POSTGRES_DB=mycloud
POSTGRES_USER=mycloud
POSTGRES_PASSWORD=надёжный-пароль
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
STORAGE_ROOT=/var/www/mycloud/backend/media/storage
MAX_UPLOAD_SIZE=52428800
```

Если сертификата ещё нет и сайт открывается по HTTP, оставьте `DJANGO_COOKIE_SECURE=false` и укажите `http://example.ru` в `DJANGO_CSRF_TRUSTED_ORIGINS`.

7. Примените миграции и соберите статику:

```bash
set -a
source /var/www/mycloud/.env
set +a
cd /var/www/mycloud/backend
./.venv/bin/python manage.py migrate
./.venv/bin/python manage.py collectstatic --noinput
sudo mkdir -p /var/www/mycloud/backend/media/storage
sudo chown -R www-data:www-data /var/www/mycloud/backend/media /var/www/mycloud/backend/staticfiles
```

8. Служба. Скопируйте `deploy/mycloud.service.example` в `/etc/systemd/system/mycloud.service`, проверьте пути и выполните:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mycloud
```

9. Nginx. За основу возьмите `deploy/nginx.conf.example`: `server_name`, путь `alias` для `/static/` и лимит `client_max_body_size` (он должен быть не меньше `MAX_UPLOAD_SIZE`). Затем:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

10. Сертификат можно выпустить бесплатным Certbot: https://certbot.eff.org/ . После перехода на HTTPS включите `DJANGO_COOKIE_SECURE=true` и перезапустите службу.

11. Откройте сайт, войдите как `admin` / `Admin123!` и смените пароль командой из раздела выше.

Повторный выклад после изменений в git:

```bash
git pull
backend/.venv/bin/pip install -r backend/requirements.txt
cd frontend && npm install && npm run build && cd ..
cd backend && ./.venv/bin/python manage.py migrate && ./.venv/bin/python manage.py collectstatic --noinput
sudo systemctl restart mycloud
```
