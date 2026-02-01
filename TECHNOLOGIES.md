# Используемые технологии и языки

## Языки программирования

### TypeScript (JavaScript)
- **Доля в проекте:** ~99%
- **Версия:** 5.4.5
- **Применение:**
  - Компоненты React
  - Хуки (hooks)
  - Утилиты и helpers
  - Типизация данных

### CSS3
- **Доля в проекте:** ~1%
- **Применение:**
  - Глобальные стили
  - CSS переменные (токены)
  - Анимации и transitions
  - Адаптивная верстка (media queries)

### HTML5
- **Применение:**
  - Структура страниц
  - SEO meta-теги
  - Семантическая разметка

### SQL
- **Применение:**
  - Схема базы данных
  - Триггеры и функции
  - RLS политики

---

## Frontend стек

### React 18.2.0
Библиотека для построения пользовательских интерфейсов.

**Используемые возможности:**
- Functional Components
- React Hooks (useState, useEffect, useCallback, useMemo, useRef)
- React.StrictMode
- Context (через пропсы)

### TypeScript 5.4.5
Типизированный JavaScript для безопасности кода.

**Особенности:**
- Строгая типизация
- Type inference
- Interface definitions
- Union types
- Generic types

### Vite 5.2.0
Современный сборщик и dev-сервер.

**Возможности:**
- Hot Module Replacement (HMR)
- Быстрая сборка
- Оптимизация production
- Поддержка TypeScript из коробки

### CSS Custom Properties
CSS переменные для управления дизайном.

```css
:root {
  --bg: #f3f1eb;
  --ink: #0b0f12;
  --accent: #0b3b2e;
  --accent-2: #10c78a;
  /* ... */
}
```

---

## Backend стек

### Supabase
Open-source альтернатива Firebase на базе PostgreSQL.

#### Supabase Auth
Аутентификация и управление пользователями.
- Google OAuth провайдер
- Управление сессиями
- Автоматическое обновление токенов

#### Supabase Database (PostgreSQL)
Реляционная база данных.
- Таблицы: profiles, leads
- Внешние ключи
- Индексы
- Триггеры

#### Row Level Security (RLS)
Безопасность на уровне строк.
- Политики доступа
- Проверка ролей
- Изоляция данных

### PostgreSQL
Мощная объектно-реляционная база данных.

**Используемые возможности:**
- UUID (генерация через pgcrypto)
- Timestamptz (timezone-aware timestamps)
- JSON/JSONB (user_metadata)
- Foreign keys
- Functions и Triggers

---

## UI/UX технологии

### Шрифты (Google Fonts)

**Space Grotesk**
- Назначение: заголовки, брендинг
- Веса: 400, 500, 600, 700
- Особенность: современный геометрический sans-serif

**IBM Plex Sans**
- Назначение: основной текст
- Веса: 300, 400, 500, 600
- Особенность: читаемость на всех размерах

**IBM Plex Mono**
- Назначение: терминал, код, технические элементы
- Веса: 400, 500
- Особенность: моноширинный для выравнивания

### Анимации

**CSS Keyframes:**
- `drift` — плавающие фоновые орбы
- `pulse` — пульсирующий индикатор
- `blink` — каретка в терминале
- `float` — левитирующие пилюли
- `menu-fade` — появление меню

**CSS Transitions:**
- Hover effects
- Transform transitions
- Opacity animations

**JavaScript Animations:**
- Intersection Observer API
- requestAnimationFrame
- CountUp анимация чисел
- Typing effect для терминала

### Адаптивный дизайн

**Подход:** Mobile-first

**Breakpoints:**
- 480px — Extra small (телефоны)
- 720px — Small (большие телефоны)
- 900px — Medium (планшеты)
- 1100px — Large (маленькие десктопы)
- >1100px — Extra large (десктопы)

**Техники:**
- CSS Grid и Flexbox
- Clamp() для fluid typography
- Minmax() для grid
- Media queries

---

## Инструменты разработки

### npm
Менеджер пакетов Node.js.
- Управление зависимостями
- Скрипты сборки
- Лок-файл для воспроизводимости

### Vite Plugins

**@vitejs/plugin-react**
- Fast Refresh
- JSX трансформация
- Оптимизация React

### TypeScript Config
- Strict mode
- ESNext target
- JSX preserve
- Module resolution: bundler

---

## Браузерные API

### Web APIs

**Intersection Observer**
- Отслеживание видимости элементов
- Ленивая загрузка анимаций
- Эффекты появления при скролле

**matchMedia**
- Проверка prefers-reduced-motion
- Адаптация под accessibility

**LocalStorage / SessionStorage**
- Хранение сессии Supabase

**Clipboard API**
- Копирование данных (для экспорта)

### Modern CSS Features

**CSS Grid**
```css
grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
```

**Flexbox**
```css
display: flex;
justify-content: space-between;
align-items: center;
```

**CSS Custom Properties**
- Токены дизайна
- Темизация
- Динамические значения через JS

**Backdrop Filter**
```css
backdrop-filter: blur(16px);
```

**CSS Logical Properties**
- inset вместо top/right/bottom/left

---

## Версии и зависимости

### Production Dependencies
```json
{
  "@supabase/supabase-js": "^2.49.1",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.2.66",
  "@types/react-dom": "^18.2.22",
  "@vitejs/plugin-react": "^4.2.1",
  "typescript": "^5.4.5",
  "vite": "^5.2.0"
}
```

---

## Архитектура и паттерны

### Компонентный подход
- **Presentational Components** — отображение данных
- **Container Components** — логика и state
- **Custom Hooks** — reusable логика

### State Management
- React useState/useReducer
- Подъем состояния (Lifting State Up)
- Props drilling (для небольшого приложения)

### Data Flow
- Unidirectional data flow
- Props down, Events up
- Callback functions

### Performance Optimizations
- React.memo (implicit through structure)
- useMemo для вычислений
- useCallback для колбэков
- Lazy loading через dynamic imports (готовность)

---

## Безопасность

### Frontend
- XSS защита (React автоматически экранирует)
- CSRF не применим (stateless API)
- Content Security Policy (рекомендуется добавить)

### Backend
- RLS политики
- Prepared statements (через Supabase)
- Input validation
- SQL injection защита

### Auth
- JWT токены
- Secure httpOnly cookies (Supabase управляет)
- OAuth 2.0
- PKCE flow

---

## Метрики и производительность

### Размер бандла
- JS: ~350KB (gzipped)
- CSS: ~20KB (gzipped)

### Производительность
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: 90+

### Оптимизации
- Tree shaking
- Code splitting (готовность)
- Gzip/Brotli сжатие
- CSS critical path
- Font display: swap
