# SHTABIX — архитектура

## Общая схема

```text
Browser
  │
  ├── https://shtabix.ru → Nginx → /var/www/shtabix
  │
  ├── Google Apps Script Web App
  │       ├── YCLIENTS
  │       ├── Telegram
  │       ├── legacy Supabase
  │       └── X-API-Key → SHTABIX internal API
  │
  └── SHTABIX API → Nginx → Fastify 127.0.0.1:3000 → PostgreSQL
```

## Frontend

- Статические `index.html`, `admin.html`, `stories.html`, `board.html`.
- Production root: `/var/www/shtabix`.
- Основной hostname: `shtabix.ru`.
- GitHub Pages остаётся rollback-источником, но не является источником файлов для `shtabix.ru`.
- Текущий frontend ещё использует Google Apps Script Web App API.
- `shtabix.com` — отдельная незавершённая задача DNS/Nginx/HTTPS; не считать готовым production hostname.

## Nginx

- Отдаёт статический frontend.
- Проксирует backend API к `http://127.0.0.1:3000`.
- Backend не должен слушать внешний интерфейс.
- Перед reload обязательно выполнять `nginx -t`.
- Использовать graceful reload.

## Backend

- Node.js 22, Fastify.
- Modular monolith, а не микросервисы.
- Один deployable процесс упрощает разработку и эксплуатацию на масштабе примерно 10–50 организаций.
- `routes/` определяет HTTP-контракты и validation.
- `services/` содержит бизнес-операции и SQL orchestration.
- `middleware/` содержит auth, API-key, tenant и access checks.
- `db/` содержит pool, tenant transactions и versioned migrations.
- `config/` читает environment configuration.

API разделён по назначению:

- `/api/public` — публичные endpoints;
- `/api/v1/auth` — пользовательская аутентификация;
- `/api/v1/owner` — owner tenant API;
- `/api/admin` — будущий admin API;
- `/api/v1/internal` — Apps Script и другие machine integrations.

## PostgreSQL

- PostgreSQL 16 является целевой основной БД.
- `organizations` — tenant SaaS.
- `branches` принадлежат организации; Yclients company ID относится к branch.
- `users`, `sessions`, memberships и RBAC обеспечивают пользовательский доступ.
- `modules` — стабильный registry модулей.
- `organization_modules` — licenses организации.
- `api_keys` и `api_key_scopes` — machine access.
- `organization_settings` — безопасные настройки tenant.
- Прикладные таблицы постепенно заменяют JSON `brixton_store.data`.

## Tenant isolation и RLS

- Источник tenant — authenticated membership или API key.
- `organization_id` из path/query/body не считается источником истины.
- PostgreSQL context устанавливается только transaction-local:

```sql
SELECT set_config('app.current_organization_id', '<uuid>', true);
```

- Tenant SQL должен выполняться внутри `withTenantTransaction()`.
- Tenant-таблицы используют RLS + FORCE RLS.
- Policies проверяют `organization_id` против `app.current_organization_id`.
- Tenant-aware composite FK гарантируют принадлежность branch той же organization.

## Users и sessions

- Email нормализуется в lowercase.
- Password hashing — Argon2id.
- Raw password не хранится и не логируется.
- Session bearer token хранится в БД только как hash.
- `/auth/me` возвращает пользователя, memberships, roles и permissions без секретов.

## Roles и permissions

Системные роли:

- owner;
- admin;
- viewer;
- platform_superadmin.

Permissions проверяются по текущему active membership. Клиентские roles/permissions не являются доверенным источником.

## Modules и licenses

Registry:

- analytics;
- tv_board;
- stories;
- tasks;
- admin_schedule;
- telegram;
- automations;
- ai.

Доступ организации хранится в `organization_modules`; helper `requireModule()` проверяет active/trial status и срок действия.

## API keys

- Формат ключа имеет prefix `shtabix_sk_`.
- Raw key показывается один раз.
- В PostgreSQL хранится SHA-256 hash.
- HTTP header: `X-API-Key`.
- Key определяет organization и scopes.
- Нельзя доверять organization ID из запроса.

## Google Apps Script

Google Apps Script временно остаётся integration/backend layer для:

- YCLIENTS;
- Telegram;
- рабочих triggers и расписаний;
- legacy Apps Script actions для HTML;
- поэтапного dual-write Supabase → SHTABIX.

Apps Script обращается к SHTABIX через internal API и `SHTABIX_API_KEY` из Script Properties.

## YCLIENTS

- Partner/user tokens находятся только в Script Properties.
- Текущие `company_id` ещё частично hardcoded в Apps Script и HTML.
- Целевая модель: company ID хранится в `branches.yclients_company_id` и отдаётся internal config API.
- Staff ID/name mapping должен в будущем храниться в нормализованной таблице masters.

## Supabase

Supabase — legacy dependency на время миграции:

- существующий `brixton_store.data` остаётся production primary для ещё не перенесённых блоков;
- для мигрируемых блоков временно сохраняются primary write, dual-write и fallback;
- service role хранится только в Apps Script Script Properties;
- новые browser writes в Supabase создавать нельзя;
- удаление Supabase возможно только после завершения migration map и периода наблюдения.
