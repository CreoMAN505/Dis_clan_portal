import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export const showBuildModal = async (interaction) => {
  const modal = new ModalBuilder()
    .setCustomId('add_build_modal')
    .setTitle('Добавить новый билд');

  const buildName = new TextInputBuilder()
    .setCustomId('build_name')
    .setLabel('Название билда')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Например: Огненный маг для PvE')
    .setRequired(true);

  const buildClass = new TextInputBuilder()
    .setCustomId('build_class')
    .setLabel('Класс')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Воин, Маг, Хил, Лучник, Разбойник')
    .setRequired(true);

  const buildLink = new TextInputBuilder()
    .setCustomId('build_link')
    .setLabel('Ссылка на билд')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://...')
    .setRequired(true);

  const buildDescription = new TextInputBuilder()
    .setCustomId('build_description')
    .setLabel('Описание билда')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Опиши особенности билда...')
    .setRequired(false);

  const firstActionRow = new ActionRowBuilder().addComponents(buildName);
  const secondActionRow = new ActionRowBuilder().addComponents(buildClass);
  const thirdActionRow = new ActionRowBuilder().addComponents(buildLink);
  const fourthActionRow = new ActionRowBuilder().addComponents(buildDescription);

  modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

  await interaction.showModal(modal);
};

export default {
  customId: 'add_build_modal',

  async execute(interaction) {
    // Пустая заглушка - логика обрабатывается в обработчике модальных окон
  }
};
