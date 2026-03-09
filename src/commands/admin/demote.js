import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PERMISSION_LEVELS } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('demote')
    .setDescription('Понизить пользователя')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Пользователь для понижения')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('role')
        .setDescription('Новая роль')
        .addChoices(
          { name: 'Новичок', value: 'Новичок' },
          { name: 'Рядовой', value: 'Рядовой' },
          { name: 'Ветеран', value: 'Ветеран' },
          { name: 'Офицер', value: 'Офицер' }
        )
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Причина понижения')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const { checkPermission } = await import('../../utils/permissions.js');
    const result = await checkPermission(interaction.user.id, PERMISSION_LEVELS.OFFICER);

    if (!result.hasAccess) {
      return await interaction.editReply({ content: result.error, ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const newRole = interaction.options.getString('role');
    const reason = interaction.options.getString('reason') || 'Не указана';
    const User = (await import('../../models/User.js')).default;

    const targetUserData = await User.findOne({ discordId: targetUser.id });

    if (!targetUserData) {
      return await interaction.editReply('Пользователь не найден в базе данных.');
    }

    // Проверяем, что понижающий имеет более высокий ранг
    if (targetUserData.getPermissionLevel() >= result.user.getPermissionLevel()) {
      return await interaction.editReply('Вы не можете понизить пользователя с равным или более высоким рангом.');
    }

    const oldRole = targetUserData.guildRole;
    targetUserData.guildRole = newRole;
    await targetUserData.save();

    // Убираем роль в Discord (если настроена)
    try {
      const member = await interaction.guild.members.fetch(targetUser.id);
      // Здесь можно добавить логику удаления Discord ролей
      // await member.roles.remove(roleId);
    } catch (error) {
      console.error('Ошибка при удалении роли в Discord:', error);
    }

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('⬇️ Понижение')
      .setDescription(`${targetUser.toString()} был понижен.`)
      .addFields(
        { name: '📈 Старая роль', value: oldRole, inline: true },
        { name: '📉 Новая роль', value: newRole, inline: true },
        { name: '📝 Причина', value: reason, inline: false }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
