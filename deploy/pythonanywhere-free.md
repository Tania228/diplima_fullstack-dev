# Бесплатный пробный деплой на PythonAnywhere

Этот вариант подходит для показа проекта и небольшого числа тестовых пользователей. Бесплатный аккаунт ограничен 512 МиБ диска и 100 CPU-секундами; веб-приложение действует один месяц и требует продления. Хранилище проекта и SQLite база будут в домашней папке аккаунта. Не храните здесь единственную копию важных файлов.

## 1. Подготовить фронтенд

На компьютере, в каталоге проекта:

```powershell
cd frontend
npm ci
npm run build
cd ..
```

Webpack создаст `backend/static/app/bundle.js` и `main.css`. Эти файлы игнорируются Git, поэтому добавьте их в репозиторий принудительно после сборки:

```powershell
git add -f backend/static/app/bundle.js backend/static/app/main.css
git add backend/config/app_config.py deploy/pythonanywhere-free.md
git commit -m "Prepare PythonAnywhere deployment"
git push
```

Если GitHub ещё не подключён, создайте приватный репозиторий и отправьте туда проект. Не добавляйте `.env`, базу данных, папку `media` или секреты.

## 2. Создать сайт и загрузить код

Создайте бесплатный аккаунт PythonAnywhere и сайт вида `имя.pythonanywhere.com` (для EU-аккаунта адрес может содержать `.eu`). В разделе **Consoles** откройте Bash и выполните, подставив URL своего репозитория:

```bash
cd ~
git clone https://github.com/ВАШ_АККАУНТ/ВАШ_РЕПОЗИТОРИЙ.git mycloud
cd ~/mycloud
python3 -m venv ~/.virtualenvs/mycloud
~/.virtualenvs/mycloud/bin/pip install -r backend/requirements.txt
mkdir -p ~/mycloud-data/storage
```

В приватном репозитории используйте GitHub доступ, разрешённый вашим бесплатным аккаунтом, или загрузите исходники через доступный интерфейс. Если `git clone` не проходит из-за сетевого ограничения, см. [список разрешённых сайтов](https://www.pythonanywhere.com/whitelist/).

## 3. Настроить Django WSGI

На вкладке **Web** создайте приложение Django с той же версией Python, что указана в вашем виртуальном окружении. Откройте ссылку на WSGI configuration file и замените содержимое на блок ниже. Замените `ВАШ_ЛОГИН` на имя PythonAnywhere аккаунта:

```python
import os
import sys

project_home = '/home/ВАШ_ЛОГИН/mycloud/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

os.environ['DJANGO_SECRET_KEY'] = 'ВСТАВЬТЕ_ДЛИННЫЙ_СЛУЧАЙНЫЙ_СЕКРЕТ'
os.environ['DJANGO_DEBUG'] = 'false'
os.environ['DJANGO_ALLOWED_HOSTS'] = 'ВАШ_ЛОГИН.pythonanywhere.com'
os.environ['DJANGO_CSRF_TRUSTED_ORIGINS'] = 'https://ВАШ_ЛОГИН.pythonanywhere.com'
os.environ['DJANGO_COOKIE_SECURE'] = 'true'
os.environ['DATABASE_ENGINE'] = 'sqlite'
os.environ['SQLITE_NAME'] = '/home/ВАШ_ЛОГИН/mycloud-data/db.sqlite3'
os.environ['STORAGE_ROOT'] = '/home/ВАШ_ЛОГИН/mycloud-data/storage'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

Секрет можно сгенерировать локально командой `python -c "from secrets import token_urlsafe; print(token_urlsafe(48))"`. Сохраните его: это секрет Django, его нельзя публиковать в GitHub.

В **Web → Virtualenv** укажите `/home/ВАШ_ЛОГИН/.virtualenvs/mycloud`.

## 4. Миграции, статика и запуск

В Bash консоли выполните:

```bash
cd ~/mycloud/backend
~/.virtualenvs/mycloud/bin/python manage.py migrate
~/.virtualenvs/mycloud/bin/python manage.py collectstatic --noinput
```

На вкладке **Web → Static files** добавьте отображение:

- URL: `/static/`
- Directory: `/home/ВАШ_ЛОГИН/mycloud/backend/staticfiles`

Нажмите **Reload** на вкладке Web и откройте адрес сайта. Войдите с начальной учётной записью `admin` / `Admin123!` и сразу смените пароль по инструкции в README.

## 5. Обновить сайт

После изменений соберите фронтенд локально, добавьте bundle-файлы через `git add -f`, отправьте изменения в GitHub. Затем в Bash консоли PythonAnywhere:

```bash
cd ~/mycloud
git pull
~/.virtualenvs/mycloud/bin/pip install -r backend/requirements.txt
cd ~/mycloud/backend
~/.virtualenvs/mycloud/bin/python manage.py migrate
~/.virtualenvs/mycloud/bin/python manage.py collectstatic --noinput
```

Нажмите **Reload** на вкладке Web после каждого обновления.

## Перенос с reg.ru

Перед переключением домена скачайте резервную копию базы и всех файлов из текущего хранилища. Перенос PostgreSQL в SQLite требует экспорта данных Django в JSON и импорта после `migrate`; файлы нужно перенести отдельно, сохранив пути из базы. Не удаляйте старый сайт, пока не проверите вход, загрузку и скачивание файлов на новом адресе.
