# 📁 Структура проекта Clan Portal Bot

```
clan_portal/
│
├── 📄 src/                          # Исходный код
│   ├── 📂 commands/                  # Slash команды
│   │   ├── 📂 admin/                # Административные команды
│   │   │   ├── promote.js          # Повышение пользователя
│   │   │   ├── demote.js           # Понижение пользователя
│   │   │   └── setupPortal.js      # Настройка портала регистрации
│   │   │
│   │   ├── 📂 builds/               # Управление билдами
│   │   │   └── build.js            # CRUD для билдов
│   │   │
│   │   ├── 📂 events/               # Управление эвентами
│   │   │   ├── event.js            # Создание, запись, отмена
│   │   │   └── eventInfo.js        # Детальная информация
│   │   │
│   │   └── 📂 utility/              # Утилитарные команды
│   │       ├── profile.js          # Просмотр профиля
│   │       ├── roster.js           # Состав гильдии
│   │       └── topOnline.js        # Топ по онлайну
│   │
│   ├── 📂 events/                    # Обработчики событий Discord
│   │   ├── ready.js                # Запуск бота
│   │   ├── interactionCreate.js    # Интерации (команды, кнопки, модалки)
│   │   ├── messageCreate.js        # Новые сообщения
│   │   └── voiceStateUpdate.js     # Вход/выход из голосовых
│   │
│   ├── 📂 handlers/                  # Загрузчики
│   │   ├── commandHandler.js       # Загрузка команд
│   │   ├── eventHandler.js         # Загрузка событий
│   │   └── modalHandler.js         # Загрузка модалок
│   │
│   ├── 📂 models/                    # Mongoose модели
│   │   ├── User.js                 # Модель пользователя
│   │   ├── Build.js                # Модель билда
│   │   └── Event.js                # Модель эвента
│   │
│   ├── 📂 modals/                    # Модальные окна
│   │   ├── registrationModal.js    # Регистрация
│   │   ├── buildModal.js           # Добавление билда
│   │   └── eventModal.js           # Создание эвента
│   │
│   ├── 📂 utils/                     # Утилиты
│   │   ├── database.js             # Подключение к MongoDB
│   │   ├── permissions.js          # Система прав
│   │   ├── middleware.js           # Middleware
│   │   └── eventHelpers.js         # Хелперы для эвентов
│   │
│   └── 📄 index.js                   # Главный файл бота
│
├── 📂 docs/                          # Документация
│   └── ROLES_SYSTEM.md             # Система ролей в эвентах
│
├── 📄 README.md                      # Основная документация
├── 📄 CHANGES.md                     # Список изменений
├── 📄 package.json                   # Зависимости проекта
├── 📄 deploy-commands.js            # Деплой команд в Discord
├── 📄 .env.example                   # Пример переменных окружения
├── 📄 .gitignore                     # Git ignore файл
└── 📄 plan.txt                       # План разработки
```

## 📊 Статистика проекта

| Категория | Количество |
|-----------|------------|
| **Команды** | 11 |
| **События Discord** | 4 |
| **Модели БД** | 3 |
| **Модальные окна** | 3 |
| **Утилиты** | 4 |
| **Всего файлов** | 28+ |

## 🎯 Команды по категориям

### 👤 Утилиты (для всех)
- `/profile` - Профиль пользователя
- `/roster` - Состав гильдии
- `/top_online` - Топ по онлайну

### 🛠️ Билды
- `/build search` - Поиск билдов
- `/build add` - Добавить билд (Ветеран+)

### 📅 Эвенты
- `/event create` - Создать эвент (Ветеран+)
- `/event list` - Список эвентов
- `/event join` - Записаться на эвент
- `/event leave` - Покинуть эвент
- `/event cancel` - Отменить эвент
- `/event_info` - Детальная информация

### 👑 Администрирование
- `/promote` - Повысить (Офицер+)
- `/demote` - Понизить (Офицер+)
- `/setup_portal` - Настроить портал (Лидер)

## 🗄️ База данных

### User (Пользователь)
```javascript
{
  discordId: String,
  gameNickname: String,
  gameClass: String,
  gearScore: Number,
  guildRole: String, // Новичок → Лидер
  activity: {
    voiceMinutes: Number,
    messagesCount: Number
  },
  builds: [ObjectId]
}
```

### Build (Билд)
```javascript
{
  name: String,
  class: String,
  author: ObjectId,
  description: String,
  link: String,
  rating: Number
}
```

### Event (Эвент)
```javascript
{
  name: String,
  description: String,
  eventType: String, // PvE, PvP, Raid, Донжон
  scheduledTime: Date,
  createdBy: ObjectId,
  participants: [{
    user: ObjectId,
    role: String, // Танк, Хил, DPS, DPS/Хил, Танк/Хил
    status: String
  }],
  maxParticipants: Number,
  minGearScore: Number,
  status: String
}
```

## 🔧 Технологический стек

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Node.js** | 18+ | Runtime |
| **Discord.js** | 14.14.1 | Discord API |
| **Mongoose** | 8.1.1 | MongoDB ODM |
| **Express** | 4.18.2 | Web server |
| **MongoDB Atlas** | - | База данных |
| **Render.com** | - | Хостинг |
| **UptimeRobot** | - | Мониторинг |

## 🚀 Следующие шаги

1. ✅ Создайте бота в Discord Developer Portal
2. ✅ Настройте MongoDB Atlas
3. ✅ Установите зависимости (`npm install`)
4. ✅ Настройте `.env` файл
5. ✅ Разверните команды (`npm run deploy-commands`)
6. ✅ Запустите бота (`npm start`)
7. ✅ Разверните на Render + UptimeRobot

---

*Проект готов к использованию! 🎉*
