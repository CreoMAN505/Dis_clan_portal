import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const loadModals = async (client) => {
  const modalsPath = join(__dirname, '../modals');
  const modalFiles = readdirSync(modalsPath).filter(file => file.endsWith('.js'));

  for (const file of modalFiles) {
    const filePath = join(modalsPath, file);
    // ✅ Используем pathToFileURL для Windows
    const fileURL = pathToFileURL(filePath).href;
    const { default: modal } = await import(fileURL);

    client.modals.set(modal.customId, modal);
    console.log(`✅ Модальное окно ${modal.customId} загружено`);
  }
};
