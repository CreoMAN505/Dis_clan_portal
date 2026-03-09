import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const loadCommands = async (client) => {
  const commandsPath = join(__dirname, '../commands');
  const commandFolders = readdirSync(commandsPath);

  const commandsArray = [];

  for (const folder of commandFolders) {
    const commandsPath2 = join(commandsPath, folder);
    const commandFiles = readdirSync(commandsPath2).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = join(commandsPath2, file);
      // ✅ Используем pathToFileURL для Windows
      const fileURL = pathToFileURL(filePath).href;
      const { default: command } = await import(fileURL);

      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsArray.push(command.data.toJSON());
        console.log(`✅ Команда ${command.data.name} загружена`);
      } else {
        console.log(`⚠️ Команда в ${filePath}缺少 обязательные свойства "data" или "execute".`);
      }
    }
  }

  return commandsArray;
};
