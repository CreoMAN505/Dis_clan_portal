import express from 'express';
import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import dotenv from 'dotenv';
import { connectDB } from './utils/database.js';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';
import { loadModals } from './handlers/modalHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint для Render/UptimeRobot
app.get('/', (req, res) => {
  res.send('Бот работает! Clan Portal Bot активен.');
});

app.listen(PORT, () => {
  console.log(`🌐 Веб-сервер запущен на порту ${PORT}`);
});

// Инициализация Discord клиента
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

// Создание коллекций для команд
client.commands = new Collection();
client.modals = new Collection();

// Подключение к базе данных
await connectDB();

// Загрузка обработчиков
await loadCommands(client);
await loadEvents(client);
await loadModals(client);

// ✅ Подробное логирование входа
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 Проверка переменных окружения:');
console.log('  DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? '✅ Загружен' : '❌ НЕ ЗАГРУЖЕН!');
console.log('  TOKEN длина:', process.env.DISCORD_TOKEN?.length || 0);
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ Загружен' : '❌ НЕ ЗАГРУЖЕН!');
console.log('  CLIENT_ID:', process.env.CLIENT_ID || '❌ НЕ ЗАГРУЖЕН!');
console.log('  GUILD_ID:', process.env.GUILD_ID || '❌ НЕ ЗАГРУЖЕН!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Вход бота
console.log('🔄 Подключение к Discord...');

// ✅ Ловим ВСЕ события от Discord
client.on('raw', data => {
  if (data.t === 'READY') {
    console.log('📡 Получено событие READY от Discord (raw)');
  }
});

client.once('ready', () => {
  console.log('✅✅✅ БОТ УСПЕШНО ПОДКЛЮЧЁН К DISCORD! ✅✅✅');
  console.log(`🤖 Бот: ${client.user.tag}`);
  console.log(`🆔 ID: ${client.user.id}`);
  console.log(`📊 Серверов: ${client.guilds.cache.size}`);
  console.log(`👥 Пользователей: ${client.users.cache.size}`);
});

client.on('error', error => {
  console.error('❌ Ошибка клиента Discord:', error.message);
  console.error('Stack:', error.stack);
});

client.on('warn', warning => {
  console.warn('⚠️ Предупреждение Discord:', warning);
});

// Пытаемся подключиться
try {
  const result = client.login(process.env.DISCORD_TOKEN);
  console.log('📡 Login вызван, результат:', result);
} catch (error) {
  console.error('❌ Ошибка ПРИ ВЫЗОВЕ login():', error.message);
  process.exit(1);
}

// Обработка ошибок
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// ✅ Увеличенный таймаут (60 секунд вместо 15)
setTimeout(() => {
  const isReady = client && client.user && client.user.tag;
  if (isReady) {
    console.log('✅ Бот готов к работе (проверка через таймаут)');
  } else {
    console.error('❌ ТАЙМАУТ: Discord не ответил за 60 секунд');
    console.error('Статус клиента:', client.status);
    console.error('WS состояние:', client.ws.status);
    console.error('Проверьте:');
    console.error('1. Правильность DISCORD_TOKEN (скопируйте заново)');
    console.error('2. Включены ли Privileged Intents (все 3 галочки)');
    console.error('3. Приглашён ли бот на сервер');
    console.error('4. Не заблокирован ли бот (проверьте в Discord)');
  }
}, 60000);
