import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
  customId: 'registration_modal',

  async execute(interaction) {
    // Создаём модальное окно
    const modal = new ModalBuilder()
      .setCustomId('registration_modal')
      .setTitle('Регистрация в гильдии');

    // Добавляем поля
    const gameNickname = new TextInputBuilder()
      .setCustomId('game_nickname')
      .setLabel('Твой игровой ник')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Например: ОгненныйМаг2000')
      .setMinLength(2)
      .setMaxLength(32)
      .setRequired(true);

    const gameClass = new TextInputBuilder()
      .setCustomId('game_class')
      .setLabel('Твой класс')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Воин, Маг, Хил, Лучник, Разбойник или Другое')
      .setRequired(true);

    const gearScore = new TextInputBuilder()
      .setCustomId('gear_score')
      .setLabel('Твой Gear Score')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Например: 550')
      .setRequired(false);

    const about = new TextInputBuilder()
      .setCustomId('about')
      .setLabel('Расскажи о себе (опционально)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Твой опыт, почему хочешь вступить в гильдию и т.д.')
      .setRequired(false);

    // Добавляем поля в модальное окно
    const firstActionRow = new ActionRowBuilder().addComponents(gameNickname);
    const secondActionRow = new ActionRowBuilder().addComponents(gameClass);
    const thirdActionRow = new ActionRowBuilder().addComponents(gearScore);
    const fourthActionRow = new ActionRowBuilder().addComponents(about);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

    await interaction.showModal(modal);
  }
};
