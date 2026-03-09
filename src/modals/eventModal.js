import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export const showEventModal = async (interaction) => {
  const modal = new ModalBuilder()
    .setCustomId('create_event_modal')
    .setTitle('Создание эвента');

  const eventName = new TextInputBuilder()
    .setCustomId('event_name')
    .setLabel('Название эвента')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Например: Raid Level 100')
    .setRequired(true);

  const eventType = new TextInputBuilder()
    .setCustomId('event_type')
    .setLabel('Тип (PvE, PvP, Raid, Донжон, Другое)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Например: Raid')
    .setRequired(true);

  const eventDate = new TextInputBuilder()
    .setCustomId('event_date')
    .setLabel('Дата и время (например: 25.12.2024 20:00)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('ДД.ММ.ГГГГ ЧЧ:ММ')
    .setRequired(true);

  const maxParticipants = new TextInputBuilder()
    .setCustomId('max_participants')
    .setLabel('Максимум участников')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Например: 10')
    .setRequired(true);

  const minGearScore = new TextInputBuilder()
    .setCustomId('min_gear_score')
    .setLabel('Минимальный Gear Score')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Например: 500')
    .setRequired(false);

  const eventDescription = new TextInputBuilder()
    .setCustomId('event_description')
    .setLabel('Описание эвента')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Дополнительная информация...')
    .setRequired(false);

  const firstActionRow = new ActionRowBuilder().addComponents(eventName);
  const secondActionRow = new ActionRowBuilder().addComponents(eventType);
  const thirdActionRow = new ActionRowBuilder().addComponents(eventDate);
  const fourthActionRow = new ActionRowBuilder().addComponents(maxParticipants);
  const fifthActionRow = new ActionRowBuilder().addComponents(minGearScore);
  const sixthActionRow = new ActionRowBuilder().addComponents(eventDescription);

  modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow, sixthActionRow);

  await interaction.showModal(modal);
};

export default {
  customId: 'create_event_modal',

  async execute(interaction) {
    // Пустая заглушка - логика обрабатывается в обработчике модальных окон
  }
};
