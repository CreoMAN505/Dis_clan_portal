import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFolders = readdirSync(commandsPath);

for (const folder of commandFolders) {
  const commandsPath2 = join(commandsPath, folder);
  const commandFiles = readdirSync(commandsPath2).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(commandsPath2, file);
    const { default: command } = await import(filePath);

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
  }
}

// Создаём REST клиент
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Деплоим команды
(async () => {
  try {
    console.log(`🔄 Начинаю обновление ${commands.length} команд...`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log(`✅ Успешно перезагружено ${data.length} команд!`);
  } catch (error) {
    console.error('❌ Ошибка при перезагрузке команд:', error);
  }
})();
