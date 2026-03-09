import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const loadModals = async (client) => {
  const modalsPath = join(__dirname, '../modals');
  const modalFiles = readdirSync(modalsPath).filter(file => file.endsWith('.js'));

  for (const file of modalFiles) {
    const filePath = join(modalsPath, file);
    const { default: modal } = await import(filePath);

    client.modals.set(modal.customId, modal);
    console.log(`✅ Модальное окно ${modal.customId} загружено`);
  }
};
