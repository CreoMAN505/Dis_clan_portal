import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PERMISSION_LEVELS } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('top_online')
    .setDescription('Топ участников по времени в голосовых каналах'),

  async execute(interaction) {
    await interaction.deferReply();

    const User = (await import('../../models/User.js')).default;

    const users = await User.find({}).sort({ 'activity.voiceMinutes': -1 }).limit(10);

    if (users.length === 0) {
      return await interaction.editReply('Нет данных об активности участников.');
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🏆 Топ по времени онлайна')
      .setTimestamp();

    const topList = users.map((user, index) => {
      const hours = Math.floor(user.activity.voiceMinutes / 60);
      const minutes = user.activity.voiceMinutes % 60;
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      return `${medal} **${user.gameNickname}** - ${hours}ч ${minutes}м (${user.guildRole})`;
    }).join('\n');

    embed.setDescription(topList);

    await interaction.editReply({ embeds: [embed] });
  }
};
