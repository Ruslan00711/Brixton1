# SHTABIX — deploy и эксплуатация

## Правила безопасности

- Не выводить и не коммитить `/etc/brixton/api.env`.
- Не выводить raw API keys, passwords, private SSH keys и Script Properties.
- Не выполнять `clasp push` или `clasp deploy` без явного подтверждения владельца.
- Не делать production migration без backup и теста на пустой временной БД.
- Не менять GitHub Pages/Supabase rollback-контур одновременно с новой миграцией.

## Доступ к VPS

```bash
ssh codex@82.202.131.125
```

Используется отдельный пользователь `codex`, не root. Root/sudo применять только для точечных системных операций.

## Frontend

Production files:

```text
/var/www/shtabix
```

Перед выкладкой:

1. Сравнить source и production-файлы.
2. Проверить отсутствие секретов.
3. Сохранить rollback-копию изменяемых файлов.
4. Копировать только согласованные HTML/assets.
5. Проверить `/`, `/board.html`, `/stories.html`, `/admin.html` и assets.

HTML не должен содержать service-role, raw owner/admin tokens или raw SHTABIX API key.

## Backend

```text
/opt/brixton/backend
```

Проверки:

```bash
cd /opt/brixton/backend
npm run check
npm run migrate:status
curl http://127.0.0.1:3000/health
```

После проверенного изменения runtime-кода:

```bash
sudo pm2 restart brixton-backend --update-env
sudo pm2 status brixton-backend
curl http://127.0.0.1:3000/health
```

Не перезапускать backend ради SQL-only migration, если runtime-код не менялся.

## Migrations

Каталог:

```text
/opt/brixton/backend/src/db/migrations
```

Процесс:

1. Сделать production backup.
2. Создать следующую versioned migration.
3. Поднять отдельную пустую test database.
4. Применить все migrations с нуля.
5. Проверить constraints, RLS, tenant isolation и repeat migrate.
6. Применить production migration через `npm run migrate`.
7. Проверить `npm run migrate:status`.

Нельзя менять уже применённую migration после фиксации checksum. Если схема требует дальнейшего изменения, создать следующую migration.

## PostgreSQL backups

Backup directory:

```text
/opt/brixton/backups/postgres
```

Script:

```text
/opt/brixton/scripts/backup-postgres.sh
```

Cron:

- ежедневно 02:30 Asia/Yekaterinburg;
- retention 14 дней;
- используется `flock`;
- отдельная read-only backup role должна видеть все строки несмотря на FORCE RLS.

Ручной backup перед migration:

```bash
sudo /opt/brixton/scripts/backup-postgres.sh
```

Архив обязательно проверить через `gzip -t` и периодически выполнять restore drill на временной БД.

## Nginx

- Frontend root: `/var/www/shtabix`.
- Backend upstream: `http://127.0.0.1:3000`.
- Перед любым reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Использовать reload, а не stop/start. `shtabix.com` настраивать отдельным согласованным этапом DNS/Nginx/HTTPS.

## Apps Script production

Script ID:

```text
1px3ysDSgcdavPkn0BHzu9CqHqAnIV5xmkkD6E1TUqV94rK_A57Xcrh87
```

Production `/exec` deployment:

```text
AKfycbyqfD8xsp2rkX0eEASg2FoYXbtYpzXlC4TeXoS09RRDjvLDAG6UCNQqcLodVWG5oebzdA
```

Последняя проверенная версия: `@135`.

### Безопасная синхронизация production → local

1. Не выполнять pull поверх локального `AppsScript/`.
2. Создать отдельный временный каталог, например `AppsScript/production-pull/`.
3. Создать в нём `.clasp.json` только с production Script ID.
4. Выполнить только:

```bash
clasp pull
```

5. Получить список deployments:

```bash
clasp deployments
```

6. При необходимости получить конкретную исполняемую версию в отдельный temp-каталог:

```bash
clasp pull --versionNumber <version>
```

7. Сравнить function-by-function production и local.
8. Сначала составить отчёт production-only/local-only/conflicts.
9. Объединять только подтверждённые изменения вручную.

Запрещено без явного подтверждения:

```text
clasp push
clasp deploy
clasp create
```

После ручного изменения production Apps Script необходимо создать новую versioned deployment revision и проверить, что frontend `/exec` указывает именно на неё.

## Secrets

VPS secrets находятся в:

```text
/etc/brixton/api.env
```

Apps Script secrets находятся в Script Properties. Документация фиксирует только имена properties, но никогда не значения.
