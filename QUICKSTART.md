# 🚀 Быстрый старт - Clan Portal Bot

## ⚡ За 5 минут к работающему боту

### Шаг 1: Discord Developer Portal (2 минуты)

1. Перейдите на https://discord.com/developers/applications
2. Нажмите **"New Application"** → Назовите "Clan Portal Bot"
3. Перейдите в **"Bot"** → **"Add Bot"**
4. **КРИТИЧЕСКИ ВАЖНО:** Включите ВСЕ три галочки:
   - ✅ **Presence Intent**
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent**
5. Скопируйте токен → **"Reset Token"** → **"Copy"**

### Шаг 2: MongoDB Atlas (1 минута)

1. Перейдите на https://www.mongodb.com/cloud/atlas
2. Зарегистрируйтесь / войдите
3. **"Create a Database"** → Выберите **FREE** tier (M0)
4. **"Connect"** → **"Connect your application"**
5. Выберите **Node.js** и версию **4.1 or later**
6. Скопируйте строку подключения (начинается с `mongodb+srv://`)

### Шаг 3: Установка бота (2 минуты)

```bash
# Клонируйте или скачайте проект
cd clan_portal

# Установите зависимости
npm install

# Создайте .env файл
# Windows (cmd)
type nul > .env

# Windows (PowerShell)
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

### Шаг 4: Настройка .env

Откройте `.env` в текстовом редакторе и вставьте:

```env
DISCORD_TOKEN=ваш_discord_токен
MONGODB_URI=ваша_mongodb_строка
CLIENT_ID=ваш_client_id
GUILD_ID=ваш_guild_id
PORT=3000
```

**Где взять ID:**
- **Client ID:** Discord Developer Portal → General Information → Application ID
- **Guild ID:**
  1. Включите Developer Mode в Discord (Settings → Advanced)
  2. Правый клик по серверу → Copy ID

### Шаг 5: Первый запуск

```bash
# Развернуть команды (ОДИН РАЗ)
node deploy-commands.js

# Запустить бота
npm start
```

### ✅ Проверка

1. Бот должен появиться онлайн в Discord
2. Напишите `/roster` - должна появиться команда
3. Создайте канал "регистрации" (для логов)
4. Напишите `/setup_portal` → выберите канал → появится кнопка регистрации

## 🎉 Поздравляем! Бот работает!

## 🌐 Деплой на Render (24/7 бесплатно)

### Шаг 1: GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Шаг 2: Render.com

1. https://render.com → Sign up
2. **"New +"** → **"Web Service"**
3. Подключите GitHub репозиторий
4. Настройки:
   - **Name:** `clan-portal-bot`
   - **Region:** Singapore (ближе к вам)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **"Advanced"** → **"Add Environment Variable"**:
   - `DISCORD_TOKEN` → ваш токен
   - `MONGODB_URI` → ваша строка MongoDB
   - `CLIENT_ID` → ваш Client ID
   - `GUILD_ID` → ваш Guild ID
   - `PORT` → `3000`
6. **"Create Web Service"**

### Шаг 3: UptimeRobot

1. https://uptimerobot.com
2. **"Add New"** → **"Monitor"**
3. **Type:** HTTP
4. **URL:** ваша-ссылка.onrender.com (взять из Render)
5. **Interval:** 14 minutes
6. **"Create Monitor"**

## 🎮 Первые команды после запуска

```bash
# Лидер (вы) должен:
/setup_portal              # Создать кнопку регистрации

# Каждый игрок:
Нажать кнопку "Вступить"   # Заполнить анкету

# Потом можно:
/profile                   # Посмотреть свой профиль
/roster                    # Состав гильдии
/event create              # Создать эвент (Ветеран+)
/event join                # Записаться на эвент
```

## ⚠️ Частые проблемы

### Бот не отвечает на команды
**Решение:** Перезапустите `npm run deploy-commands`

### "Interaction failed"
**Решение:** Проверьте, что включены все Privileged Intents

### Ошибка подключения к MongoDB
**Решение:** Проверьте IP whitelist в MongoDB Atlas (должен быть 0.0.0.0/0)

### Бот засыпает на Render
**Решение:** Настройте UptimeRobot на пинг каждые 14 минут

## 📞 Нужна помощь?

Смотрите документацию:
- `README.md` - Полное руководство
- `docs/ROLES_SYSTEM.md` - Система ролей
- `docs/PROJECT_STRUCTURE.md` - Структура проекта
- `CHANGES.md` - Последние изменения

---

**Удачи с вашей гильдией! 🎮⚔️**
