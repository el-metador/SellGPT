# Документация

## Обзор
Лендинг построен на React + TypeScript (Vite). Есть две версии страницы:
- `index.html` — base‑версия.
- `index-sales.html` — sales‑версия с более агрессивным копирайтом.

Обе версии включают:
- автопереход в Telegram (таймер + кнопка отмены);
- форму заявки с автогенерацией сообщения в Telegram;
- типографику в стиле openai/chatgpt;
- анимации (фоновые орбы, shimmer, reveal, typing‑terminal).

## Запуск
```bash
npm install
npm run dev
```

## Сборка
```bash
npm run build
npm run preview
```

## Основные настройки
### Telegram URL
В `src/App.tsx`:
```
const TELEGRAM_URL = "https://t.me/imnotsheikh";
```

### Таймер редиректа
```
const REDIRECT_SECONDS = 12;
```

### Отключение автоперехода
Можно:
- удалить компонент `redirect-banner`;
- не запускать эффект редиректа в `App`.

### Форма заявки
Форма собирает:
- имя
- Telegram
- количество мест
- компания (опционально)
- цели (опционально)

При отправке открывается Telegram с готовым сообщением.

## Где редактировать тексты
Все тексты находятся в `src/App.tsx` (объект `VARIANT_COPY`).

## Анимации
- `drift` — движение фоновых орбов.
- `pulse` — индикатор статуса.
- `shimmer` — подсветка моделей.
- `reveal` — появление карточек при скролле.
- typing‑анимации в терминалах (hook `useTypingEffect`).

## CSS
Все стили в `src/styles.css`:
- токены и палитра в `:root`
- секции `hero`, `pricing`, `card`, `terminal`
- адаптив в `@media (max-width: 900px)`

## Рекомендации
- Для A/B можно добавить параметр `variant` и переключать копирайт.
- Для интеграций — отправка формы в CRM до открытия Telegram.

