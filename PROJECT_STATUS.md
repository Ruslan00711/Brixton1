# SHTABIX — состояние проекта

Актуальность handoff: 8 августа 2026 года, часовой пояс Asia/Yekaterinburg.

## Production

- VPS: Beget, Ubuntu 24.04.
- Backend: Node.js 22 + Fastify, modular monolith.
- Backend path: `/opt/brixton/backend`.
- Backend слушает только `127.0.0.1:3000`.
- Process manager: PM2, процесс `brixton-backend`.
- Последний проверенный PID: `54794` (PID меняется после restart).
- Reverse proxy и frontend: Nginx.
- Production frontend: `https://shtabix.ru`, файлы находятся в `/var/www/shtabix`.
- PostgreSQL 16, production database `brixton`, application role `brixton_app`.
- `/health` возвращает `status=ok` и `database=connected`.
- Основные старые страницы: `/`, `/board.html`, `/stories.html`, `/admin.html`.
- GitHub Pages и Supabase пока сохраняются как rollback/legacy-контур.

`shtabix.com` не считать завершённым production hostname: DNS, отдельная конфигурация Nginx и HTTPS остаются отдельной задачей.

## Backend modular monolith

Основная структура:

```text
/opt/brixton/backend
├── index.js
├── package.json
└── src
    ├── app.js
    ├── config/
    ├── db/
    ├── middleware/
    ├── routes/
    └── services/
```

Работают:

- `/health`;
- `/organizations` — переходный endpoint;
- `/api/v1/auth/login`, `/logout`, `/me`;
- tenant context и permission helpers;
- internal config/settings API;
- internal free slots API;
- internal announcements API;
- internal goals API;
- API-key authentication через `X-API-Key`;
- PostgreSQL tenant transaction через transaction-local `app.current_organization_id`.

## PostgreSQL migrations

Production применены migrations 001–013:

| Migration | Назначение |
|---|---|
| `001_baseline.sql` | `organizations`, `branches` |
| `002_users.sql` | Пользователи |
| `003_organization_memberships.sql` | Связь users ↔ organizations |
| `004_roles_permissions.sql` | RBAC, roles, permissions |
| `005_sessions.sql` | Серверные сессии |
| `006_rls_foundation.sql` | Tenant context и RLS foundation |
| `007_modules.sql` | Каталог модулей |
| `008_organization_modules.sql` | Лицензии модулей организаций |
| `009_api_keys.sql` | Machine API keys и scopes |
| `010_organization_settings.sql` | Настройки организации |
| `011_free_slots.sql` | Snapshots и свободные окна |
| `012_announcements.sql` | Объявления |
| `013_goals.sql` | Цели филиалов и мастеров |

Последний `npm run migrate:status` показывал все 001–013 как `APPLIED`. Повторный migrate на тестовой БД давал `SKIP`.

## Multi-tenant и RLS

- Production organization BRIXTON: `6a778c5d-e8be-49b5-a273-130691b3116f`.
- Филиалы: Менделеева (`yclients_company_id=694866`) и Энтузиастов (`yclients_company_id=1076318`).
- Tenant определяется по authenticated membership или API key, а не по `organization_id` клиента.
- Tenant-таблицы используют `ENABLE ROW LEVEL SECURITY` и `FORCE ROW LEVEL SECURITY`.
- Backend обращается к tenant-таблицам через `withTenantTransaction()`.
- Составные FK `(organization_id, branch_id)` не позволяют связать tenant-строку с чужим филиалом.
- Cross-tenant SELECT/INSERT/UPDATE/DELETE проверялись на временных БД.

## Auth, roles и API keys

- Password hashing: Argon2id.
- В БД хранится только `password_hash`.
- Session token показывается клиенту, но в БД хранится только hash.
- Базовые роли: `owner`, `admin`, `viewer`, `platform_superadmin`.
- Базовые permissions и module licenses уже заложены.
- Raw API key в БД не хранится; хранится SHA-256 hash и безопасный prefix.
- Production API key `BRIXTON Apps Script` создан и хранится в Google Apps Script Script Properties как `SHTABIX_API_KEY`.
- Raw key нельзя записывать в Git, Markdown, логи или исходники.

## Apps Script и clasp

- Локальные исходники: `AppsScript/Код.gs`, `AppsScript/TABLO.gs`, `AppsScript/Diag.gs`.
- Production Script ID: `1px3ysDSgcdavPkn0BHzu9CqHqAnIV5xmkkD6E1TUqV94rK_A57Xcrh87`.
- Production Web App deployment ID: `AKfycbyqfD8xsp2rkX0eEASg2FoYXbtYpzXlC4TeXoS09RRDjvLDAG6UCNQqcLodVWG5oebzdA`.
- Последняя проверенная исполняемая версия: `@135`.
- Второй deployment существует на `@HEAD`, но frontend его не использует.
- `admin.html` обращается к versioned `/exec` deployment выше.
- Production Apps Script изменялся вручную; перед следующими изменениями production необходимо снова сделать отдельный `clasp pull` и сравнить с local.
- `clasp push`, `clasp deploy` и автоматическое объединение запрещены без явного подтверждения владельца.

Секреты Apps Script находятся в Script Properties:

- `YCLIENTS_PARTNER_TOKEN`;
- `YCLIENTS_USER_TOKEN`;
- `TELEGRAM_BOT_TOKEN`;
- `SUPABASE_SERVICE_ROLE`;
- `BRIXTON_ADMIN_TOKEN`;
- `BRIXTON_OWNER_TOKEN`;
- `SHTABIX_API_KEY`.

## Статус миграции модулей

### freeSlots — MIGRATING

- PostgreSQL/SHTABIX работает.
- Таблицы `free_slot_snapshots`, `free_slots` работают с RLS.
- Dual-write работает.
- Чтение: SHTABIX primary.
- При отказе SHTABIX используется Supabase fallback.
- Старый Supabase write пока остаётся primary и не отключён.

### announcements — MIGRATING

- PostgreSQL/SHTABIX работает.
- Dual-write Supabase → SHTABIX работает.
- Чтение: SHTABIX primary через `getAnnouncementsData_()`.
- Supabase остаётся fallback.
- Supabase primary write пока остаётся.
- Production PostgreSQL содержит 3 актуальных объявления BRIXTON.

### goals / salesGoals / masterGoals — MIGRATING

- Migration `013_goals.sql` применена.
- Production PostgreSQL: 2 строки `branch_goals`, 11 строк `master_goals`.
- Dual-write работает, production comparison был `ok=true`.
- Чтение: SHTABIX primary через `getGoalsData_()`.
- Supabase остаётся fallback и primary write.
- `getAdminData_()` использует `getGoalsData_()`.
- `doGetTvBoard()` использует `getGoalsData_()`.
- `sendMasterReport()` использует `getGoalsData_()`.
- Прямых Supabase reads `goals`, `salesGoals`, `masterGoals` вне fallback нет.

## Ещё зависят от Supabase

- `adminSchedules`;
- `admins`;
- `shifts`;
- `tasks`, `taskSent`, `taskLog`, `eventTasks`;
- owner sections: `months`, `current`, `trn`, `salaries`, `notes`, `goods_manual`, `cohorts`, `adSpend`, `sourceMasterShare`;
- TV monthly/current analytics read model;
- старые primary writes и fallbacks для freeSlots, announcements и goals.

## Локальный Git

На момент handoff рабочее дерево уже было dirty до создания документации. В нём есть изменения Apps Script и untracked `AppsScript/production-pull/`. Их нельзя сбрасывать, удалять или автоматически объединять. Commit/push в рамках handoff не выполнялись.
