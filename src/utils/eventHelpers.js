import { StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Event from '../../models/Event.js';
import User from '../../models/User.js';

/**
 * Показать меню выбора роли для записи на эвент
 */
export const showEventRoleSelect = async (interaction) => {
  const eventId = interaction.customId.replace('event_join_', '');

  try {
    const event = await Event.findById(eventId).populate('participants.user', 'gameNickname');

    if (!event) {
      return await interaction.reply({ content: 'Эвент не найден.', ephemeral: true });
    }

    if (event.status !== 'Набор открыт') {
      return await interaction.reply({ content: 'Набор на этот эвент закрыт.', ephemeral: true });
    }

    const user = await User.findOne({ discordId: interaction.user.id });
    if (!user) {
      return await interaction.reply({ content: 'Вы не зарегистрированы в системе.', ephemeral: true });
    }

    // Проверяем GS
    if (user.gearScore < event.minGearScore) {
      return await interaction.reply({
        content: `У вас недостаточный Gear Score. Требуется: ${event.minGearScore}, у вас: ${user.gearScore}`,
        ephemeral: true
      });
    }

    // Проверяем, не записан ли уже
    const alreadyJoined = event.participants.find(p => p.user._id.toString() === user._id.toString());
    if (alreadyJoined) {
      return await interaction.reply({ content: 'Вы уже записаны на этот эвент!', ephemeral: true });
    }

    // Проверяем лимит
    if (event.participants.length >= event.maxParticipants) {
      return await interaction.reply({ content: 'Эвент уже полностью укомплектован!', ephemeral: true });
    }

    // Создаём меню выбора роли
    const select = new StringSelectMenuBuilder()
      .setCustomId(`event_role_select_${eventId}`)
      .setPlaceholder('Выберите вашу роль')
      .addOptions(
        {
          label: '🛡️ Танк',
          value: 'Танк',
          description: 'Главный танкователь урона'
        },
        {
          label: '💚 Хил',
          value: 'Хил',
          description: 'Лечитель группы'
        },
        {
          label: '⚔️ DPS',
          value: 'DPS',
          description: 'Урон в ближнем или дальнем бою'
        },
        {
          label: '⚔️💚 DPS/Хил',
          value: 'DPS/Хил',
          description: 'Гибрид: может наносить урон и лечить'
        },
        {
          label: '🛡️💚 Танк/Хил',
          value: 'Танк/Хил',
          description: 'Гибрид: может танковать и лечить'
        }
      );

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({
      content: `📋 Выберите вашу роль для эвента "${event.name}":`,
      components: [row],
      ephemeral: true
    });

  } catch (error) {
    console.error('Ошибка при показе меню ролей:', error);
    await interaction.reply({ content: 'Произошла ошибка.', ephemeral: true });
  }
};

/**
 * Показать информацию об эвенте
 */
export const showEventInfo = async (interaction) => {
  const eventId = interaction.customId.replace('event_info_', '');

  try {
    const event = await Event.findById(eventId)
      .populate('createdBy', 'gameNickname')
      .populate('participants.user', 'gameNickname');

    if (!event) {
      return await interaction.reply({ content: 'Эвент не найден.', ephemeral: true });
    }

    // Группируем участников по ролям
    const roleGroups = {
      'Танк': [],
      'Хил': [],
      'DPS': [],
      'DPS/Хил': [],
      'Танк/Хил': []
    };

    event.participants.forEach(p => {
      roleGroups[p.role].push(p.user.gameNickname);
    });

    const participantsList = Object.entries(roleGroups)
      .filter(([_, players]) => players.length > 0)
      .map(([role, players]) => `${role}: ${players.join(', ')}`)
      .join('\n') || 'Пока нет участников';

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(`🎉 ${event.name}`)
      .setDescription(event.description || 'Нет описания')
      .addFields(
        { name: '📅 Дата', value: event.scheduledTime.toLocaleString('ru-RU'), inline: true },
        { name: '🎮 Тип', value: event.eventType, inline: true },
        { name: '💪 Мин. GS', value: event.minGearScore.toString(), inline: true },
        { name: '👥 Участников', value: `${event.participants.length}/${event.maxParticipants}`, inline: true },
        { name: '👤 Организатор', value: event.createdBy.gameNickname, inline: true },
        { name: '📊 Состав', value: participantsList || 'Пока нет участников', inline: false }
      )
      .setFooter({ text: `ID: ${event._id}` })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  } catch (error) {
    console.error('Ошибка при показе информации об эвенте:', error);
    await interaction.reply({ content: 'Произошла ошибка.', ephemeral: true });
  }
};

/**
 * Обработать выбор роли
 */
export const handleRoleSelect = async (interaction) => {
  const eventId = interaction.customId.replace('event_role_select_', '');
  const selectedRole = interaction.values[0];

  await interaction.deferReply({ ephemeral: true });

  try {
    const event = await Event.findById(eventId);
    const user = await User.findOne({ discordId: interaction.user.id });

    if (!event || !user) {
      return await interaction.editReply('Произошла ошибка.');
    }

    // Добавляем участника
    event.participants.push({
      user: user._id,
      role: selectedRole,
      status: 'Участник'
    });

    await event.save();

    await interaction.editReply(`✅ Вы успешно записались на эвент "${event.name}" как ${selectedRole}!`);

    // Обновляем сообщение эвента
    await updateEventMessage(interaction, event);

  } catch (error) {
    console.error('Ошибка при записи на эвент:', error);
    await interaction.editReply('Произошла ошибка при записи на эвент.');
  }
};

/**
 * Обновить сообщение эвента
 */
async function updateEventMessage(interaction, event) {
  try {
    const channel = await interaction.guild.channels.fetch(event.channelId);
    if (!channel) return;

    const message = await channel.messages.fetch(event.messageId);
    if (!message) return;

    // Группируем участников по ролям
    const roleCounts = {
      'Танк': 0,
      'Хил': 0,
      'DPS': 0,
      'DPS/Хил': 0,
      'Танк/Хил': 0
    };

    event.participants.forEach(p => {
      if (roleCounts[p.role] !== undefined) {
        roleCounts[p.role]++;
      }
    });

    const roleStats = Object.entries(roleCounts)
      .filter(([_, count]) => count > 0)
      .map(([role, count]) => `${role}: ${count}`)
      .join(' | ');

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(`🎉 ${event.name}`)
      .setDescription(event.description || 'Нет описания')
      .addFields(
        { name: '📅 Дата', value: event.scheduledTime.toLocaleString('ru-RU'), inline: true },
        { name: '🎮 Тип', value: event.eventType, inline: true },
        { name: '💪 Мин. GS', value: event.minGearScore.toString(), inline: true },
        { name: '👥 Участников', value: `${event.participants.length}/${event.maxParticipants}`, inline: true },
        { name: '📊 Состав', value: roleStats || 'Пока нет участников', inline: false },
        { name: '🆔 ID', value: `\`${event._id}\``, inline: true }
      )
      .setFooter({ text: 'Запись: /event join' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`event_join_${event._id}`)
          .setLabel('✅ Записаться')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`event_info_${event._id}`)
          .setLabel('ℹ️ Инфо')
          .setStyle(ButtonStyle.Primary)
      );

    await message.edit({ embeds: [embed], components: [row] });

  } catch (error) {
    console.error('Ошибка при обновлении сообщения эвента:', error);
  }
}
