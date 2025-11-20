# Multistream - Мультистрим приложение на Next.js

Приложение для просмотра нескольких стримов одновременно.

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📦 Деплой

### Вариант 1: Vercel (Рекомендуется - самый простой)

**Через веб-интерфейс:**

1. Загрузите проект на GitHub/GitLab/Bitbucket
2. Перейдите на [vercel.com](https://vercel.com)
3. Войдите через GitHub/GitLab/Bitbucket
4. Нажмите "Add New Project"
5. Выберите ваш репозиторий
6. Vercel автоматически определит Next.js и настроит всё
7. Нажмите "Deploy"

**Через CLI:**

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в аккаунт
vercel login

# Задеплойте проект
vercel

# Для production деплоя
vercel --prod
```

### Вариант 2: Netlify

**Через веб-интерфейс:**

1. Загрузите проект на GitHub/GitLab/Bitbucket
2. Перейдите на [netlify.com](https://netlify.com)
3. Войдите и нажмите "Add new site" → "Import an existing project"
4. Выберите репозиторий
5. Настройки сборки:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. Нажмите "Deploy site"

**Через CLI:**

```bash
# Установите Netlify CLI
npm i -g netlify-cli

# Войдите в аккаунт
netlify login

# Задеплойте
netlify deploy --prod
```

### Вариант 3: Docker (для собственного сервера)

Создайте `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Установка зависимостей
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production образ
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**Важно:** Добавьте в `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
};
```

Затем:

```bash
# Сборка образа
docker build -t multistream .

# Запуск контейнера
docker run -p 3000:3000 multistream
```

### Вариант 4: Обычный VPS/сервер

```bash
# На сервере установите Node.js 20+
# Клонируйте репозиторий
git clone <ваш-репозиторий>
cd multistream

# Установите зависимости
npm install

# Соберите проект
npm run build

# Запустите production сервер
npm start
```

Для постоянной работы используйте PM2:

```bash
npm install -g pm2
pm2 start npm --name "multistream" -- start
pm2 save
pm2 startup
```

## 📝 Примечания

- Проект использует Next.js 16 с App Router
- Стилизация через Tailwind CSS и DaisyUI
- Все зависимости указаны в `package.json`
- Для production сборки выполните `npm run build` перед деплоем
