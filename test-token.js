import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Проверка токена...');
console.log('TOKEN:', process.env.DISCORD_TOKEN ? 'Загружен' : 'НЕ ЗАГРУЖЕН!');
console.log('TOKEN длина:', process.env.DISCORD_TOKEN?.length || 0);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.once('ready', () => {
  console.log('✅ ТОКЕН ПРАВИЛЬНЫЙ!');
  console.log(`Бот: ${client.user.tag}`);
  console.log(`Серверов: ${client.guilds.cache.size}`);
  process.exit(0);
});

client.on('error', (error) => {
  console.error('❌ Ошибка токена:', error.message);
  process.exit(1);
});

client.login(process.env.DISCORD_TOKEN);

// Таймаут 10 секунд
setTimeout(() => {
  console.error('❌ ТАЙМАУТ: Discord не ответил за 10 секунд');
  console.error('Возможные причины:');
  console.error('1. Неверный токен');
  console.error('2. Проблемы с сетью');
  process.exit(1);
}, 10000);
