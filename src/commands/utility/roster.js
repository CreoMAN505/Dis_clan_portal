import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PERMISSION_LEVELS } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roster')
    .setDescription('Список всех членов гильдии')
    .addStringOption(option =>
      option
        .setName('filter')
        .setDescription('Фильтр по роли')
        .addChoices(
          { name: 'Новичок', value: 'Новичок' },
          { name: 'Рядовой', value: 'Рядовой' },
          { name: 'Ветеран', value: 'Ветеран' },
          { name: 'Офицер', value: 'Офицер' },
          { name: 'Лидер', value: 'Лидер' }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const filter = interaction.options.getString('filter');
    const User = (await import('../../models/User.js')).default;

    // Формируем запрос
    const query = filter ? { guildRole: filter } : {};
    const users = await User.find(query).sort({ guildRole: -1, gameNickname: 1 });

    if (users.length === 0) {
      return await interaction.editReply('Не найдено ни одного участника.');
    }

    // Группируем по ролям
    const groupedUsers = {
      'Лидер': users.filter(u => u.guildRole === 'Лидер'),
      'Офицер': users.filter(u => u.guildRole === 'Офицер'),
      'Ветеран': users.filter(u => u.guildRole === 'Ветеран'),
      'Рядовой': users.filter(u => u.guildRole === 'Рядовой'),
      'Новичок': users.filter(u => u.guildRole === 'Новичок')
    };

    // Создаём Embed
    const embed = new EmbedBuilder()
      .setColor(0x00BFFF)
      .setTitle('📋 Состав гильдии')
      .setTimestamp();

    let totalMembers = 0;

    for (const [role, members] of Object.entries(groupedUsers)) {
      if (members.length > 0) {
        totalMembers += members.length;
        const memberList = members.map(member => {
          const gs = member.gearScore > 0 ? ` [${member.gearScore}]` : '';
          return `• ${member.gameNickname}${gs} (${member.gameClass})`;
        }).join('\n');

        embed.addFields({
          name: `${role} (${members.length})`,
          value: memberList,
          inline: false
        });
      }
    }

    embed.setFooter({ text: `Всего участников: ${totalMembers}` });

    await interaction.editReply({ embeds: [embed] });
  }
};
