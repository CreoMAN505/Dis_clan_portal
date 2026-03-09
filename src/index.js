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

// ✅ Вход бота СНАЧАЛА (остальное уже загружено)
console.log('🔄 Подключение к Discord...');
client.login(process.env.DISCORD_TOKEN);

// Обработка ошибок подключения
client.on('error', error => {
  console.error('❌ Ошибка подключения к Discord:', error.message);
});

// Обработка ошибок
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});
