import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PERMISSION_LEVELS } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Просмотреть профиль пользователя')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Пользователь (оставьте пустым для просмотра своего профиля)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user') || interaction.user;
    const { checkPermission } = await import('../../utils/permissions.js');

    // Проверяем, смотрит ли пользователь свой профиль или чужой
    const isOwnProfile = targetUser.id === interaction.user.id;
    const viewingOtherUser = !isOwnProfile;

    // Если просматривают чужой профиль, нужны права Офицера+
    if (viewingOtherUser) {
      const result = await checkPermission(interaction.user.id, PERMISSION_LEVELS.OFFICER);
      if (!result.hasAccess) {
        return await interaction.editReply({
          content: 'У вас нет прав для просмотра чужих профилей. Необходима роль Офицера или выше.',
          ephemeral: true
        });
      }
    }

    // Ищем пользователя в базе
    const User = (await import('../../models/User.js')).default;
    const user = await User.findOne({ discordId: targetUser.id }).populate('builds');

    if (!user) {
      return await interaction.editReply(
        isOwnProfile
          ? 'Вы не зарегистрированы в системе. Используйте кнопку регистрации.'
          : 'Пользователь не найден в базе данных.'
      );
    }

    // Создаём красивый Embed
    const embed = new EmbedBuilder()
      .setColor(user.guildRole === 'Лидер' ? 0xFFD700 :
                user.guildRole === 'Офицер' ? 0xFF4500 :
                user.guildRole === 'Ветеран' ? 0x00BFFF :
                user.guildRole === 'Рядовой' ? 0x32CD32 : 0x808080)
      .setTitle(`📜 Профиль: ${user.gameNickname}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: '🎮 Класс', value: user.gameClass, inline: true },
        { name: '⚔️ Gear Score', value: user.gearScore.toString(), inline: true },
        { name: '👑 Звание', value: user.guildRole, inline: true },
        { name: '🎤 В голосовых каналах', value: `${Math.floor(user.activity.voiceMinutes / 60)}ч ${user.activity.voiceMinutes % 60}м`, inline: true },
        { name: '💬 Сообщений', value: user.activity.messagesCount.toString(), inline: true },
        { name: '📅 В гильдии с', value: new Date(user.joinedAt).toLocaleDateString('ru-RU'), inline: true }
      )
      .setTimestamp();

    // Добавляем информацию о билдах, если есть
    if (user.builds && user.builds.length > 0) {
      embed.addFields({
        name: '🛠️ Билды',
        value: user.builds.map(build => `[${build.name}](${build.link})`).join('\n') || 'Нет билдов',
        inline: false
      });
    }

    await interaction.editReply({ embeds: [embed] });
  }
};
