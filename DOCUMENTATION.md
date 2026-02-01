# Документация SellGPT

## Содержание

1. [Архитектура проекта](#архитектура-проекта)
2. [База данных](#база-данных)
3. [Аутентификация](#аутентификация)
4. [Компоненты React](#компоненты-react)
5. [Стили и адаптивность](#стили-и-адаптивность)
6. [API Reference](#api-reference)

---

## Архитектура проекта

### Общая схема

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Пользователь  │────▶│  React Frontend │────▶│  Supabase       │
│   (Браузер)     │◀────│  (Vite + TS)    │◀────│  (Postgres)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                        │
                               ▼                        ▼
                        ┌─────────────┐          ┌─────────────┐
                        │  Google     │          │  RLS        │
                        │  OAuth      │          │  Policies   │
                        └─────────────┘          └─────────────┘
```

### Поток данных

1. Пользователь открывает лендинг
2. При отправке формы → данные сохраняются в `leads`
3. При входе через Google → создается запись в `profiles`
4. Admin видит заявки через фильтр RLS

---

## База данных

### Таблицы

#### 1. `profiles` — Профили пользователей

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK, ссылка на auth.users |
| `email` | text | Email пользователя |
| `full_name` | text | Полное имя |
| `avatar_url` | text | URL аватарки |
| `role` | text | Роль: 'user' или 'admin' |
| `created_at` | timestamptz | Дата создания |
| `updated_at` | timestamptz | Дата обновления |

**RLS Policies:**
```sql
-- Пользователь видит только свой профиль
create policy "Profiles are viewable by owner" 
  on public.profiles for select 
  using (auth.uid() = id);

-- Пользователь может создать свой профиль
create policy "Profiles are insertable by owner" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Пользователь может обновить свой профиль
create policy "Profiles are updatable by owner" 
  on public.profiles for update 
  using (auth.uid() = id);
```

#### 2. `leads` — Заявки клиентов

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK, auto-generated |
| `created_at` | timestamptz | Дата создания заявки |
| `name` | text | Имя клиента (обязательное) |
| `email` | text | Email (обязательное) |
| `telegram` | text | Telegram username |
| `seats` | integer | Количество мест |
| `company` | text | Название компании |
| `goal` | text | Цели/задачи |
| `status` | text | Статус: 'new', 'in_progress', 'done' |
| `notes` | text | Внутренние заметки |
| `assigned_to` | uuid | FK на profiles (ответственный) |
| `source` | text | Источник заявки (base/sales) |
| `last_contacted_at` | timestamptz | Последний контакт |

**RLS Policies:**
```sql
-- Любой может создать заявку
create policy "Anyone can create lead" 
  on public.leads for insert 
  with check (true);

-- Только admin может просматривать
create policy "Admins can view leads" 
  on public.leads for select 
  using (public.is_admin());

-- Только admin может обновлять
create policy "Admins can update leads" 
  on public.leads for update 
  using (public.is_admin()) 
  with check (public.is_admin());
```

### Функции

#### `is_admin()`

Проверяет, имеет ли текущий пользователь роль admin:

```sql
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;
```

#### `handle_new_user()`

Триггер-функция для автоматического создания профиля:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
```

### Триггеры

```sql
-- Автосоздание профиля при регистрации
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Автообновление updated_at
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
```

---

## Аутентификация

### Поток входа

```
1. Пользователь нажимает "Войти через Google"
   ↓
2. Supabase Auth перенаправляет на Google OAuth
   ↓
3. Google возвращает токен
   ↓
4. Supabase создает/обновляет запись в auth.users
   ↓
5. Триггер создает профиль в public.profiles
   ↓
6. Пользователь видит личный кабинет
```

### Управление сессией

```typescript
// Проверка сессии при загрузке
supabase.auth.getSession().then(({ data }) => {
  setSession(data.session);
});

// Подписка на изменения auth состояния
supabase.auth.onAuthStateChange((_event, newSession) => {
  setSession(newSession);
});
```

### Выход

```typescript
const handleSignOut = async () => {
  await supabase.auth.signOut();
};
```

---

## Компоненты React

### Основные компоненты

#### `App`

Главный компонент приложения. Принимает пропсы:

```typescript
type Props = {
  variant: "base" | "sales";  // Вариант копирайта
  page: "home" | "account" | "terms" | "privacy";  // Текущая страница
};
```

#### `LeadCard`

Карточка заявки в админ-панели:

```typescript
type Props = {
  lead: Lead;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  selectable?: boolean;
};
```

#### `AdminStats`

Статистика заявок:

```typescript
type Props = {
  leads: Lead[];
};
```

### Custom Hooks

#### `useTypingEffect`

Эффект печати текста для терминала:

```typescript
function useTypingEffect(
  lines: string[],    // Строки для печати
  speed: number,      // Скорость (мс)
  resetDelay: number  // Задержка перед повтором (мс)
): string;
```

#### `useInView`

Отслеживание видимости элемента:

```typescript
function useInView<T extends HTMLElement>(): {
  ref: React.RefObject<T>;
  isInView: boolean;
};
```

#### `useCountUp`

Анимация счетчика чисел:

```typescript
function useCountUp(
  target: number,     // Целевое значение
  enabled: boolean,   // Включена ли анимация
  duration?: number   // Длительность (мс)
): number;
```

#### `usePrefersReducedMotion`

Учет предпочтений пользователя по анимации:

```typescript
function usePrefersReducedMotion(): boolean;
```

---

## Стили и адаптивность

### CSS Variables (токены)

```css
:root {
  --bg: #f3f1eb;              /* Фон */
  --ink: #0b0f12;             /* Основной текст */
  --muted: #52606b;           /* Вторичный текст */
  --accent: #0b3b2e;          /* Основной акцент */
  --accent-2: #10c78a;        /* Зеленый */
  --accent-3: #1f6bff;        /* Синий */
  --accent-4: #ffb347;        /* Оранжевый */
  --card: #ffffff;            /* Карточки */
  --line: rgba(11, 15, 18, 0.08);  /* Границы */
  --glow: rgba(16, 199, 138, 0.18); /* Свечение */
  --shadow: 0 24px 60px rgba(11, 15, 18, 0.12);
  --radius: 22px;
}
```

### Адаптивные точки

| Breakpoint | Ширина | Изменения |
|------------|--------|-----------|
| Desktop | >1100px | Полная сетка, 2 колонки |
| Tablet | 900-1100px | Одноколоночный layout |
| Mobile | 720-900px | Компактная навигация |
| Small | <720px | Мобильное меню |
| XS | <480px | Минимальные отступы |

### Ключевые анимации

#### Drift (фоновые орбы)
```css
@keyframes drift {
  0%, 100% { transform: translate(-10%, -10%) scale(1); }
  50% { transform: translate(8%, 6%) scale(1.08); }
}
```

#### Reveal (появление карточек)
```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

#### Pulse (индикатор активности)
```css
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 var(--glow); }
  70% { box-shadow: 0 0 0 10px rgba(0, 163, 122, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 163, 122, 0); }
}
```

---

## API Reference

### Supabase Client

Инициализация клиента:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

### Методы работы с заявками

#### Создание заявки

```typescript
const { error } = await supabase
  .from("leads")
  .insert({
    name: "Иван",
    email: "ivan@example.com",
    telegram: "@ivan",
    seats: 5,
    company: "Acme Inc",
    goal: "Автоматизация отдела продаж",
    status: "new",
  });
```

#### Получение заявок (только для admin)

```typescript
const { data, error } = await supabase
  .from("leads")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(200);
```

#### Обновление заявки

```typescript
const { error } = await supabase
  .from("leads")
  .update({ status: "in_progress", notes: "Позвонил клиент" })
  .eq("id", leadId);
```

#### Удаление заявки

```typescript
const { error } = await supabase
  .from("leads")
  .delete()
  .eq("id", leadId);
```

### Auth API

#### Вход через Google

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: window.location.href },
});
```

#### Выход

```typescript
const { error } = await supabase.auth.signOut();
```

#### Получение текущей сессии

```typescript
const { data: { session } } = await supabase.auth.getSession();
```

---

## Расширение функционала

### Добавление нового поля в заявку

1. **База данных:**
```sql
alter table public.leads add column phone text;
```

2. **Форма (App.tsx):**
```tsx
<label className="form-field">
  Телефон
  <input type="tel" name="phone" placeholder="+7 999 123-45-67" />
</label>
```

3. **Обработка отправки:**
```typescript
const phone = data.get("phone")?.toString().trim();
const payload = {
  // ...
  phone: phone || null,
};
```

### Добавление нового провайдера авторизации

1. В Supabase Console: **Authentication → Providers**
2. Включите нужный провайдер (GitHub, GitLab, etc.)
3. Настройте OAuth credentials
4. Обновите код:
```typescript
await supabase.auth.signInWithOAuth({
  provider: "github",
  options: { redirectTo: window.location.href },
});
```

---

## Оптимизация производительности

### Рекомендации

1. **Используйте `useMemo`** для фильтрации и сортировки
2. **`useCallback`** для обработчиков событий
3. **`React.memo`** для компонентов списков
4. **Lazy loading** для тяжелых компонентов
5. **Пагинация** при большом количестве заявок

### Текущие оптимизации

- Intersection Observer для анимаций появления
- RAF для скролла и pointer событий
- Дебаунсинг анимаций
- `prefers-reduced-motion` поддержка
