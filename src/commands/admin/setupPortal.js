import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { PERMISSION_LEVELS } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup_portal')
    .setDescription('Настроить портал регистрации гильдии')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Канал для отправки сообщения с регистрацией')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const { checkPermission } = await import('../../utils/permissions.js');
    const result = await checkPermission(interaction.user.id, PERMISSION_LEVELS.LEADER);

    if (!result.hasAccess) {
      return await interaction.editReply({ content: result.error, ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');

    // Создаём красивое Embed
    const embed = new EmbedBuilder()
      .setColor(0x00BFFF)
      .setTitle('🏰 Добро пожаловать в портал гильдии!')
      .setDescription(`
**🎮 Мы рады видеть тебя в наших рядах!**

Для вступления в гильдию необходимо заполнить анкету.
Нажми на кнопку ниже, чтобы начать регистрацию.

**📋 Что тебя ждёт:**
• Участие в рейдах и ивентах
• Доступ к базе билдов
• Дружная комьюнити
• Помощь опытных игроков

**⚠️ После регистрации:**
1. Твой ник в Discord будет изменён на игровой
2. Ты получишь роль "Новичок"
3. Офицеры рассмотрят твою заявку
      `.trim())
      .setThumbnail(interaction.guild.iconURL())
      .setFooter({ text: 'Нажми на кнопку ниже для регистрации' })
      .setTimestamp();

    // Создаём кнопку
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('register_button')
          .setLabel('📝 Вступить в гильдию')
          .setStyle(ButtonStyle.Success)
      );

    // Отправляем сообщение в указанный канал
    await channel.send({
      content: '@everyone',
      embeds: [embed],
      components: [row]
    });

    await interaction.editReply(`✅ Портал регистрации успешно создан в канале ${channel}!`);
  }
};
