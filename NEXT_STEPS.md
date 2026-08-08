# SHTABIX — следующие шаги

## Точный следующий этап

**MIGRATE ADMIN SCHEDULES FROM SUPABASE TO SHTABIX**

На первом проходе не переключать чтение и не отключать Supabase.

План:

1. Синхронизировать production Apps Script → отдельный pull-каталог и проверить актуальный `adminSchedules` payload.
2. Найти все reads/writes `adminSchedules` в `Код.gs`, `TABLO.gs`, Stories и admin actions.
3. Зафиксировать реальную структуру:
   - branch/Yclients company ID;
   - month key;
   - day;
   - administrator value/code;
   - правила пустых дней и удаления.
4. Перед изменениями сделать PostgreSQL backup.
5. Создать migration `014_admin_schedules.sql`.
6. Создать нормализованные PostgreSQL tables с `organization_id`, `branch_id`, RLS + FORCE RLS и tenant-aware FK.
7. Создать service на `withTenantTransaction()`.
8. Создать internal GET/PUT API.
9. Использовать существующие scopes:
   - `admin_schedule.read`;
   - `admin_schedule.write`.
10. Проверить на временной БД migrations 001–014, repeat migrate, malformed payload и cross-tenant isolation.
11. Активировать backend endpoint.
12. Локально добавить dual-write после успешного старого Supabase save.
13. Добавить GET comparison по всем branch/month/day/value.
14. Ошибка SHTABIX не должна ломать старый Supabase save.
15. Чтение на первом этапе оставить в Supabase.
16. Production Apps Script автоматически не менять; подготовить точные фрагменты для ручного переноса.

## Порядок после adminSchedules

1. `admins` + `shifts`.
2. `tasks`, `taskSent`, `taskLog`, `eventTasks`.
3. Owner sections.
4. `cohorts`.
5. `months/current` + analytics.
6. Единый TV read model.
7. Полный отказ от Supabase.

Каждый модуль переносить одинаковыми фазами:

```text
schema/API
→ test database
→ production backend
→ dual-write
→ comparison
→ SHTABIX read primary + Supabase fallback
→ observation period
→ SHTABIX write primary
→ удаление fallback
```

## Backlog

### Traffic и производительность

- Повторно измерить фактическую частоту Apps Script/Supabase/SHTABIX запросов.
- Убирать full `data` GET/PATCH по мере миграции секций.
- Добавить server-side aggregation для analytics и TV.
- Проверить CacheService и отсутствие параллельных retry-цепочек.
- Оптимизировать HTML/Apps Script по egress и частоте polling.

### shtabix.com

- Проверить DNS A/AAAA.
- Создать отдельный Nginx server block.
- Выпустить/проверить HTTPS.
- Определить redirect или отдельное назначение домена.
- Не затрагивать работающий `shtabix.ru` без rollback-конфигурации.

### Служебная страница

Создать защищённую `/dev` или `/system` страницу со статусами:

- frontend version;
- backend health/version/PID;
- PostgreSQL connectivity;
- migration status;
- последняя backup date;
- Apps Script deployment/version;
- integration status без вывода секретов.

### Первый внешний клиент

- Organization onboarding UI.
- Создание branches.
- Настройка Yclients company IDs.
- Создание owner/admin users и memberships.
- Выбор modules/licenses.
- Создание API key для Apps Script.
- Настройка organization settings.
- Telegram chats/topics per organization.
- Mapping masters/staff IDs.
- Генерация TV/admin/stories ссылок.
- Onboarding должен выполняться через интерфейс, а не изменением кода.

### YCLIENTS Marketplace

После стабилизации multi-tenant backend:

- изучить требования Marketplace;
- реализовать OAuth/installation flow вместо ручных токенов;
- хранить credentials зашифрованно вне исходников;
- поддерживать разные компании Yclients для разных branches;
- добавить health/reconnect/revoke flow;
- подготовить privacy/security documentation.

## Перед возобновлением

1. Прочитать все пять handoff-документов.
2. Проверить local `git status`, ничего не сбрасывать.
3. Выполнить read-only `clasp pull` в отдельный каталог.
4. Проверить production deployment version — последняя известная `@135`.
5. Проверить `npm run migrate:status` — последняя известная migration `013_goals.sql`.
6. Начать только с аудита `adminSchedules`.
