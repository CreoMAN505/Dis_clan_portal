import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PERMISSION_LEVELS } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Повысить пользователя')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Пользователь для повышения')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('role')
        .setDescription('Новая роль')
        .addChoices(
          { name: 'Рядовой', value: 'Рядовой' },
          { name: 'Ветеран', value: 'Ветеран' },
          { name: 'Офицер', value: 'Офицер' },
          { name: 'Лидер', value: 'Лидер' }
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const { checkPermission } = await import('../../utils/permissions.js');
    const result = await checkPermission(interaction.user.id, PERMISSION_LEVELS.OFFICER);

    if (!result.hasAccess) {
      return await interaction.editReply({ content: result.error, ephemeral: true });
    }

    // Лидер может повышать до Лидера, Офицер только до Ветерана
    const newRole = interaction.options.getString('role');
    const requesterLevel = result.user.getPermissionLevel();

    if (newRole === 'Лидер' && requesterLevel < 4) {
      return await interaction.editReply('Только Лидер может назначать новых Лидеров.');
    }

    if (newRole === 'Офицер' && requesterLevel < 4) {
      return await interaction.editReply('Только Лидер может назначать Офицеров.');
    }

    const targetUser = interaction.options.getUser('user');
    const User = (await import('../../models/User.js')).default;

    const targetUserData = await User.findOne({ discordId: targetUser.id });

    if (!targetUserData) {
      return await interaction.editReply('Пользователь не найден в базе данных.');
    }

    const oldRole = targetUserData.guildRole;
    targetUserData.guildRole = newRole;
    await targetUserData.save();

    // Выдаём роль в Discord (если настроена)
    try {
      const member = await interaction.guild.members.fetch(targetUser.id);
      // Здесь можно добавить логику выдачи Discord ролей
      // await member.roles.add(roleId);
    } catch (error) {
      console.error('Ошибка при выдаче роли в Discord:', error);
    }

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('⬆️ Повышение')
      .setDescription(`${targetUser.toString()} был повышен!`)
      .addFields(
        { name: '📉 Старая роль', value: oldRole, inline: true },
        { name: '📈 Новая роль', value: newRole, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
