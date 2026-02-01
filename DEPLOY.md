# Инструкция по деплою SellGPT

## Содержание

1. [Деплой на Vercel](#деплой-на-vercel)
2. [Деплой на Netlify](#деплой-на-netlify)
3. [Деплой на собственный сервер](#деплой-на-собственный-сервер)
4. [Настройка домена](#настройка-домена)
5. [HTTPS и SSL](#https-и-ssl)

---

## Деплой на Vercel

### Подготовка к деплою

1. **Зарегистрируйтесь** на [vercel.com](https://vercel.com)
2. **Подключите GitHub/GitLab/Bitbucket** аккаунт

### Шаг 1: Импорт проекта

1. Нажмите **"Add New..." → "Project"**
2. Выберите репозиторий с проектом
3. Vercel автоматически определит настройки Vite

### Шаг 2: Настройка сборки

Убедитесь, что настройки сборки следующие:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Шаг 3: Переменные окружения

Добавьте переменные окружения (Environment Variables):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Важно:** Переменные должны начинаться с `VITE_` чтобы быть доступными в клиентском коде.

### Шаг 4: Deploy

Нажмите **"Deploy"** и дождитесь завершения сборки (обычно 1-2 минуты).

### Шаг 5: Настройка Redirects

Для корректной работы маршрутизации создайте файл `vercel.json` в корне проекта:

```json
{
  "rewrites": [
    { "source": "/dashboard", "destination": "/dashboard.html" },
    { "source": "/terms", "destination": "/terms.html" },
    { "source": "/privacy", "destination": "/privacy.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Дополнительные настройки Vercel

#### Analytics (опционально)

1. Перейдите в **Settings → Analytics**
2. Включите **Vercel Analytics**
3. Добавьте скрипт в `index.html` если требуется

#### Speed Insights (опционально)

1. **Settings → Speed Insights**
2. Включите для мониторинга производительности

---

## Деплой на Netlify

### Способ 1: Через Git

1. Зарегистрируйтесь на [netlify.com](https://netlify.com)
2. Нажмите **"Add new site" → "Import an existing project"**
3. Выберите Git провайдер и репозиторий
4. Настройки сборки:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
5. Добавьте Environment Variables
6. Нажмите **"Deploy site"**

### Способ 2: Drag & Drop

1. Выполните локальную сборку: `npm run build`
2. Перетащите папку `dist` в интерфейс Netlify

### Настройка `_redirects`

Создайте файл `public/_redirects`:

```
/dashboard  /dashboard.html  200
/terms      /terms.html      200
/privacy    /privacy.html    200
/*          /index.html      200
```

---

## Деплой на собственный сервер

### Требования к серверу

- **Nginx** или **Apache**
- **Node.js** 18+ (если используете SSR)
- **SSL сертификат** (Let's Encrypt)

### Сборка

```bash
# Локальная сборка
npm ci
npm run build

# Папка dist содержит готовое приложение
scp -r dist/ user@server:/var/www/sellgpt/
```

### Настройка Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/sellgpt/dist;
    index index.html;

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Маршрутизация для SPA
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    # Отдельные страницы
    location = /dashboard {
        try_files /dashboard.html =404;
    }

    location = /terms {
        try_files /terms.html =404;
    }

    location = /privacy {
        try_files /privacy.html =404;
    }
}
```

### Настройка Apache

Создайте файл `.htaccess` в папке `dist`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Если файл или директория существуют, используем их
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Иначе отдаем html файл
  RewriteRule ^(.*)$ $1.html [L]
</IfModule>

# Gzip сжатие
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# Кэширование
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

---

## Настройка домена

### На Vercel

1. Перейдите в **Project Settings → Domains**
2. Введите ваш домен: `your-domain.com`
3. Добавьте DNS записи по инструкции:
   - **Type A:** `@` → `76.76.21.21`
   - **Type CNAME:** `www` → `cname.vercel-dns.com`

### На Netlify

1. **Site settings → Domain management**
2. **Add custom domain**
3. Подтвердите владение доменом
4. Обновите DNS:
   - **Type A:** `@` → Netlify IP
   - **Type CNAME:** `www` → ваш-сайт.netlify.app

### DNS настройки (общие)

```
Type    Name    Value                TTL
A       @       76.76.21.21          600
CNAME   www     cname.vercel-dns.com 600
```

---

## HTTPS и SSL

### Vercel

SSL сертификат выдается автоматически через Let's Encrypt.

### Netlify

SSL сертификат выдается автоматически. Проверьте в:
**Domain management → HTTPS**

### Собственный сервер (Let's Encrypt)

```bash
# Установка Certbot
sudo apt-get install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автообновление
sudo certbot renew --dry-run
```

---

## Проверка после деплоя

### Чек-лист

- [ ] Сайт открывается по HTTPS
- [ ] Главная страница работает
- [ ] Форма заявки отправляет данные
- [ ] Google OAuth работает
- [ ] Личный кабинет доступен
- [ ] Админ-панель видит заявки (проверить с ролью admin)
- [ ] Мобильная версия отображается корректно
- [ ] CSV экспорт работает

### Инструменты проверки

```bash
# Проверка SSL
curl -I https://your-domain.com

# Проверка скорости
# Используйте Google PageSpeed Insights

# Проверка мобильной версии
# Chrome DevTools → Toggle device toolbar
```

---

## Устранение проблем деплоя

### Проблема: 404 на страницах

**Решение:** Настройте rewrites в `vercel.json` или `_redirects`

### Проблема: Env variables не работают

**Решение:** 
1. Проверьте префикс `VITE_`
2. Перезапустите деплой после добавления переменных

### Проблема: Supabase connection error

**Решение:**
1. Проверьте URL и ANON_KEY
2. Убедитесь, что в Supabase разрешены запросы с вашего домена (CORS)

### Проблема: Медленная загрузка

**Решение:**
1. Включите gzip/brotli сжатие
2. Настройте кэширование статики
3. Используйте CDN для изображений
