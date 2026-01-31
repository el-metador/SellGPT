# ChatGPT Business Landing (React + TypeScript)

Одностраничный лендинг для продажи доступа к ChatGPT Business на 1 месяц за $20.

## Файлы
- `index.html` — основная версия (base).
- `index-sales.html` — sales‑версия (агрессивнее по копирайту).
- `src/App.tsx` — разметка и логика.
- `src/styles.css` — стили.
- `DOCUMENTATION.md` — подробная документация (RU).
- `DOCUMENTATION.ru.md` — дубль документации (RU).
- `DOCUMENTATION.en.md` — documentation (EN).
- `FAQ.md` — FAQ/политики (RU).
- `FAQ.ru.md` — дубль FAQ (RU).
- `FAQ.en.md` — FAQ/policies (EN).

## Быстрый старт
```bash
npm install
npm run dev
```

## Сборка
```bash
npm run build
npm run preview
```

## Настройка Telegram
В `src/App.tsx`:
```
const TELEGRAM_URL = "https://t.me/imnotsheikh";
```

## Варианты
- Base: `index.html`
- Sales: `index-sales.html`

## Языковые версии документации
- RU: `DOCUMENTATION.md`, `FAQ.md`
- EN: `DOCUMENTATION.en.md`, `FAQ.en.md`
