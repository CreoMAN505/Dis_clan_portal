import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('event_info')
    .setDescription('Подробная информация об эвенте')
    .addStringOption(option =>
      option
        .setName('event_id')
        .setDescription('ID эвента')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const Event = (await import('../../models/Event.js')).default;
    const eventId = interaction.options.getString('event_id');

    try {
      const event = await Event.findById(eventId)
        .populate('createdBy', 'gameNickname')
        .populate('participants.user', 'gameNickname');

      if (!event) {
        return await interaction.editReply('Эвент не найден.');
      }

      // Группируем участников по ролям
      const roleGroups = {
        '🛡️ Танк': [],
        '💚 Хил': [],
        '⚔️ DPS': [],
        '⚔️💚 DPS/Хил': [],
        '🛡️💚 Танк/Хил': []
      };

      event.participants.forEach(p => {
        const roleEmoji = {
          'Танк': '🛡️',
          'Хил': '💚',
          'DPS': '⚔️',
          'DPS/Хил': '⚔️💚',
          'Танк/Хил': '🛡️💚'
        };
        const key = `${roleEmoji[p.role] || ''} ${p.role}`;
        if (roleGroups[key]) {
          roleGroups[key].push(`• ${p.user.gameNickname}`);
        }
      });

      // Формируем список участников
      const participantsList = Object.entries(roleGroups)
        .filter(([_, players]) => players.length > 0)
        .map(([role, players]) => `**${role}** (${players.length})\n${players.join('\n')}`)
        .join('\n\n') || 'Пока нет участников';

      // Статистика по ролям
      const roleStats = Object.entries(roleGroups)
        .map(([role, players]) => `${role}: ${players.length}`)
        .join(' | ');

      const embed = new EmbedBuilder()
        .setColor(
          event.status === 'Отменено' ? 0xFF0000 :
          event.status === 'Завершено' ? 0x808080 :
          event.status === 'В процессе' ? 0xFFA500 : 0xFFD700
        )
        .setTitle(`🎉 ${event.name}`)
        .setDescription(event.description || 'Нет описания')
        .addFields(
          { name: '📅 Дата и время', value: event.scheduledTime.toLocaleString('ru-RU'), inline: true },
          { name: '🎮 Тип', value: event.eventType, inline: true },
          { name: '📊 Статус', value: event.status, inline: true },
          { name: '💪 Мин. GS', value: event.minGearScore.toString(), inline: true },
          { name: '👥 Участников', value: `${event.participants.length}/${event.maxParticipants}`, inline: true },
          { name: '👤 Организатор', value: event.createdBy.gameNickname, inline: true }
        )
        .addFields({
          name: '📋 Состав группы',
          value: participantsList || 'Пока нет участников',
          inline: false
        })
        .setFooter({ text: `ID: ${event._id}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Ошибка при получении информации об эвенте:', error);
      await interaction.editReply('Произошла ошибка при получении информации об эвенте.');
    }
  }
};
