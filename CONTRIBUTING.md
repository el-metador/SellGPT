# Руководство по внесению изменений

Спасибо за интерес к проекту! Этот документ поможет вам начать работу с кодовой базой.

## Структура проекта

```
src/
├── App.tsx           # Главный компонент
├── main.tsx          # Точка входа
├── styles.css        # Глобальные стили
└── supabaseClient.ts # Настройка Supabase
```

## Начало работы

### 1. Форк и клонирование

```bash
# Форкните репозиторий на GitHub
# Затем клонируйте свой форк
git clone https://github.com/your-username/gpt.git
cd gpt
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка окружения

```bash
cp .env.example .env
# Отредактируйте .env добавив свои ключи Supabase
```

### 4. Запуск development сервера

```bash
npm run dev
```

## Соглашения по коду

### TypeScript

- Используйте строгую типизацию
- Избегайте `any`
- Определяйте интерфейсы для props

```typescript
// Хорошо
interface Props {
  name: string;
  count: number;
  onClick: () => void;
}

// Плохо
function Component(props: any) { ... }
```

### Компоненты

- Используйте functional components
- Называйте компоненты с заглавной буквы
- Один компонент — один файл

```typescript
// Хорошо
export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// Плохо
function btn(props) { ... }
```

### Стили

- Используйте CSS переменные из `:root`
- Mobile-first подход
- BEM-подобная нотация для классов

```css
/* Хорошо */
.btn-primary { ... }
.card__title { ... }

/* Плохо */
.button { ... } /* слишком общее */
.x { ... }       /* непонятно */
```

## Добавление новой функциональности

### Добавление новой страницы

1. Создайте HTML файл в корне:
```html
<!-- newpage.html -->
<!doctype html>
<html lang="ru">
  <head>...</head>
  <body>
    <div id="root" data-variant="base" data-page="newpage"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

2. Добавьте тип страницы:
```typescript
// App.tsx
export type Page = "home" | "account" | "terms" | "privacy" | "newpage";
```

3. Обновите `main.tsx`:
```typescript
const page: Page = 
  rootElement.dataset.page === "newpage" ? "newpage" :
  rootElement.dataset.page === "account" ? "account" :
  // ...
  "home";
```

4. Добавьте рендеринг в App.tsx:
```typescript
{page === "newpage" ? <NewPageComponent /> : null}
```

5. Обновите `vite.config.ts`:
```javascript
input: {
  // ...
  newpage: "newpage.html",
}
```

### Добавление нового поля в форму

1. Обновите таблицу в Supabase:
```sql
alter table public.leads add column phone text;
```

2. Добавьте тип:
```typescript
type Lead = {
  // ...
  phone: string | null;
};
```

3. Добавьте поле в форму:
```tsx
<label className="form-field">
  Телефон
  <input type="tel" name="phone" placeholder="+7 999 123-45-67" />
</label>
```

4. Обновите обработчик:
```typescript
const phone = data.get("phone")?.toString().trim();
const payload = {
  // ...
  phone: phone || null,
};
```

## Тестирование

### Ручное тестирование

- [ ] Страница загружается без ошибок
- [ ] Форма отправляет данные
- [ ] Валидация работает
- [ ] Мобильная версия отображается корректно
- [ ] Google OAuth работает
- [ ] Админ-панель доступна для admin

### Проверка типов

```bash
npx tsc --noEmit
```

### Сборка

```bash
npm run build
```

## Pull Request процесс

1. Создайте ветку для фичи:
```bash
git checkout -b feature/my-feature
```

2. Сделайте изменения и коммит:
```bash
git add .
git commit -m "feat: добавил новую функцию"
```

3. Отправьте в свой форк:
```bash
git push origin feature/my-feature
```

4. Создайте Pull Request на GitHub

### Сообщения коммитов

Используйте conventional commits:

- `feat:` — новая функциональность
- `fix:` — исправление бага
- `docs:` — изменение документации
- `style:` — форматирование, без изменения кода
- `refactor:` — рефакторинг
- `test:` — добавление тестов
- `chore:` — обслуживание

Примеры:
```
feat: добавил экспорт заявок в CSV
fix: исправил отображение на iOS
docs: обновил инструкцию по деплою
```

## Чек-лист перед коммитом

- [ ] Код компилируется без ошибок TypeScript
- [ ] Сборка проходит успешно (`npm run build`)
- [ ] Нет `console.log` (кроме отладки)
- [ ] Код отформатирован единообразно
- [ ] Добавлены комментарии для сложной логики
- [ ] Обновлена документация (если нужно)

## Сообщество

### Вопросы

Если у вас есть вопросы:
1. Проверьте [FAQ.md](./FAQ.md)
2. Поищите в существующих issues
3. Создайте новый issue с тегом `question`

### Сообщения о багах

При создании issue укажите:
- Описание проблемы
- Шаги для воспроизведения
- Ожидаемое поведение
- Скриншоты (если применимо)
- Браузер и версия

## Лицензия

Внося изменения, вы соглашаетесь с тем, что ваш код будет под MIT License.
