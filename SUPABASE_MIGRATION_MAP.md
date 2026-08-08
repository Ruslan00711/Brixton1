# SHTABIX — карта отказа от Supabase

## Текущая legacy-модель

Основная таблица Supabase: `public.brixton_store`.

- `id=main`: большой JSON `data` со всеми основными разделами.
- `id=shifts`: отдельный JSON состояния смен.
- Apps Script использует service-role из Script Properties.
- HTML больше не должен содержать service-role и опасные прямые записи.

## DONE — инфраструктура переноса

- PostgreSQL, versioned migrations и RLS foundation.
- Multi-tenant organizations/branches.
- Machine API keys и scopes.
- Internal config/settings API.
- Supabase service-role вынесен из исходников в Script Properties.
- Опасные browser admin/owner операции проходят через Apps Script.
- Backup role видит все tenant-данные независимо от FORCE RLS.

## MIGRATING

### freeSlots

Текущее состояние:

- PostgreSQL: `free_slot_snapshots`, `free_slots`;
- API: `PUT /api/v1/internal/free-slots/snapshot`, `GET /api/v1/internal/free-slots`;
- dual-write работает;
- чтение SHTABIX primary;
- Supabase fallback;
- Supabase primary write остаётся.

Для завершения:

1. Наблюдать стабильность и сравнения.
2. Сделать SHTABIX primary write.
3. Временно оставить Supabase fallback.
4. После периода наблюдения удалить Supabase write/fallback freeSlots.

### announcements

Текущее состояние:

- PostgreSQL: `announcements`;
- API: `GET/PUT /api/v1/internal/announcements`;
- dual-write и comparison работают;
- чтение SHTABIX primary через `getAnnouncementsData_()`;
- Supabase fallback;
- Supabase primary write остаётся.

Для завершения — тот же порядок: SHTABIX primary write → период наблюдения → удалить legacy write/fallback.

### goals / salesGoals / masterGoals

Текущее состояние:

- PostgreSQL: `branch_goals`, `master_goals`;
- API: `GET/PUT /api/v1/internal/goals`;
- production: 2 branch rows, 11 master rows;
- dual-write и comparison работают;
- чтение SHTABIX primary через `getGoalsData_()`;
- consumers: `getAdminData_`, `doGetTvBoard`, `sendMasterReport`;
- прямых Supabase reads вне fallback нет;
- Supabase primary write и fallback остаются.

## NOT STARTED

### adminSchedules

Сейчас:

```text
data.adminSchedules[yclients_company_id][yyyy-MM][day] = admin code/name
```

Consumers: Stories, TV Board и Apps Script schedule actions.

Цель:

- `admin_schedules` / `admin_schedule_entries`;
- `GET/PUT /api/v1/internal/admin-schedules`;
- scopes `admin_schedule.read/write`;
- dual-write + comparison;
- затем read switch с fallback.

### admins и shifts

- `data.admins`: списки администраторов по филиалам.
- `id=shifts`: дневное operational state по branch.
- Используются Telegram callbacks, morning shift prompt и daily summary.
- Цель: `admins`, `admin_branch_assignments`, `admin_shifts`, `admin_shift_assignments`.

### tasks и Telegram task state

- `data.tasks` — правила задач.
- `data.taskSent` — отправленные задачи/idempotency.
- `data.taskLog` — отметки выполнения.
- `data.eventTasks` — события листа ожидания.
- Consumers: `sendDueTasks`, `saveWaitlistTaskForSummary`, Telegram `doPost`, daily summary.
- Цель: `tasks`, `task_schedule_rules`, `task_dispatches`, `task_completions`, `event_tasks`.
- Требуются атомарность и idempotency, иначе возможны повторные Telegram-сообщения.

### Owner sections

- `trn` → `tournaments`, `tournament_entries`;
- `salaries` → `salary_settings`, `salary_calculations`;
- `notes` → `owner_notes`;
- `goods_manual` → `goods_manual_adjustments`;
- `adSpend` → `advertising_spend`;
- `sourceMasterShare` → organization metric settings.

Нельзя переносить одним новым большим JSON. Нужны секционные endpoints и server-side transaction merge.

### cohorts

- Сейчас хранится `data.cohorts`.
- Создаётся `recalcCohorts()`.
- Цель: `cohort_metrics` и отдельный analytics endpoint.

### months/current и analytics

- Самый большой и связанный блок.
- Используется owner dashboard, imports, custom periods и TV Board.
- Цель: `reporting_periods`, `branch_period_metrics`, `master_period_metrics`, `source_period_metrics`, daily aggregates.
- Нельзя пересчитывать всю историю при каждом запросе.
- Нужна поэтапная shadow-write/compare миграция текущего месяца, затем истории.

### TV read model

После нормализации источников создать агрегирующий endpoint, например:

```text
GET /api/v1/internal/tv-board
```

Он должен собирать цели, announcements, schedules и агрегированную аналитику, не читая legacy JSON.

## Оставшиеся типы Supabase операций

- Full GET/PATCH `data` в owner/admin section saves.
- Month/current writes из imports и monthly updates.
- Cohort full read-modify-write.
- Admin schedule read/write.
- Admin/task state read/write.
- Shift row read/write.
- TV projection оставшихся `adminSchedules` и current-month analytics.
- Primary writes/fallbacks мигрирующих freeSlots, announcements и goals.

## Рекомендуемый порядок

1. `adminSchedules`.
2. `admins` + `shifts`.
3. `tasks`, `taskSent`, `taskLog`, `eventTasks`.
4. Owner sections, кроме months/current/cohorts.
5. `cohorts`.
6. `months/current` + analytics.
7. TV read model.
8. Отключить legacy writes/fallbacks freeSlots, announcements, goals после периода наблюдения.
9. Удалить Supabase wrappers и service role.

## Что пока нельзя трогать

- Нельзя отключать Supabase primary write для мигрирующих блоков без периода стабильного сравнения.
- Нельзя переключать tasks state без атомарной/idempotent модели.
- Нельзя разрывать `months/current` до готовности owner dashboard и TV analytics.
- Нельзя удалять `adminSchedules` из TV projection до отдельного read switch.
- Нельзя удалять `SUPABASE_SERVICE_ROLE`, пока существует хотя бы один Supabase GET/POST/PATCH.

## Условия окончательного удаления SUPABASE_SERVICE_ROLE

1. Все секции `brixton_store` имеют PostgreSQL schema и API.
2. Все writes переключены на SHTABIX.
3. Все reads переключены на SHTABIX.
4. Supabase fallback отключён после согласованного периода наблюдения.
5. Telegram, TV, Stories, admin и owner проверены без Supabase.
6. Поиск по Apps Script не находит `SUPABASE_URL`, `getSupabaseServiceRole_` и `/rest/v1` в runtime code.
7. Supabase backup экспортирован и проверен.
8. Только после этого Script Property `SUPABASE_SERVICE_ROLE` можно удалить.
