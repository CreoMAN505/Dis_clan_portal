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
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ Загружен' : '❌ НЕ ЗАГРУЖЕН!');
console.log('  CLIENT_ID:', process.env.CLIENT_ID || '❌ НЕ ЗАГРУЖЕН!');
console.log('  GUILD_ID:', process.env.GUILD_ID || '❌ НЕ ЗАГРУЖЕН!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Вход бота
console.log('🔄 Подключение к Discord...');

try {
  client.login(process.env.DISCORD_TOKEN);
} catch (error) {
  console.error('❌ Ошибка при login():', error.message);
  process.exit(1);
}

// Обработка успешного подключения
client.once('ready', () => {
  console.log('✅✅✅ БОТ УСПЕШНО ПОДКЛЮЧЁН К DISCORD! ✅✅✅');
});

// Обработка ошибок WebSocket
client.on('error', error => {
  console.error('❌ Ошибка клиента Discord:', error.message);
});

client.on('warn', warning => {
  console.warn('⚠️ Предупреждение Discord:', warning);
});

// Обработка ошибок
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Таймаут подключения
setTimeout(() => {
  console.error('❌ ТАЙМАУТ: Discord не ответил за 15 секунд');
  console.error('Проверьте:');
  console.error('1. Правильность DISCORD_TOKEN');
  console.error('2. Включены ли Privileged Intents');
  console.error('3. Приглашён ли бот на сервер');
}, 15000);
