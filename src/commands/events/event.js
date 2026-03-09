import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { PERMISSION_LEVELS } from '../../utils/permissions.js';
import Event from '../../models/Event.js';

export default {
  data: new SlashCommandBuilder()
    .setName('event')
    .setDescription('Управление эвентами')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Создать новый эвент')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Список всех эвентов')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('join')
        .setDescription('Записаться на эвент')
        .addStringOption(option =>
          option
            .setName('event_id')
            .setDescription('ID эвента')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('role')
            .setDescription('Ваша роль в эвенте')
            .addChoices(
              { name: '🛡️ Танк', value: 'Танк' },
              { name: '💚 Хил', value: 'Хил' },
              { name: '⚔️ DPS', value: 'DPS' },
              { name: '⚔️💚 DPS/Хил', value: 'DPS/Хил' },
              { name: '🛡️💚 Танк/Хил', value: 'Танк/Хил' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('leave')
        .setDescription('Покинуть эвент')
        .addStringOption(option =>
          option
            .setName('event_id')
            .setDescription('ID эвента')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cancel')
        .setDescription('Отменить эвент')
        .addStringOption(option =>
          option
            .setName('event_id')
            .setDescription('ID эвента')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const { checkPermission } = await import('../../utils/permissions.js');
    const User = (await import('../../models/User.js')).default;
    const subcommand = interaction.options.getSubcommand();

    // Проверяем регистрацию пользователя
    const user = await User.findOne({ discordId: interaction.user.id });
    if (!user) {
      return await interaction.editReply('Вы не зарегистрированы в системе. Используйте кнопку регистрации.');
    }

    switch (subcommand) {
      case 'create':
        await handleCreateEvent(interaction, user);
        break;
      case 'list':
        await handleListEvents(interaction);
        break;
      case 'join':
        await handleJoinEvent(interaction, user);
        break;
      case 'leave':
        await handleLeaveEvent(interaction, user);
        break;
      case 'cancel':
        await handleCancelEvent(interaction, user);
        break;
    }
  }
};

// Создание эвента
async function handleCreateEvent(interaction, user) {
  const result = await checkPermission(interaction.user.id, PERMISSION_LEVELS.VETERAN);

  if (!result.hasAccess) {
    return await interaction.editReply({ content: result.error, ephemeral: true });
  }

  // Показываем модальное окно для создания эвента
  const { showEventModal } = await import('../../modals/eventModal.js');
  await showEventModal(interaction);
}

// Список эвентов
async function handleListEvents(interaction) {
  const events = await Event.find({ status: { $in: ['Запланировано', 'Набор открыт'] } })
    .populate('createdBy', 'gameNickname')
    .populate('participants.user', 'gameNickname')
    .sort({ scheduledTime: 1 });

  if (events.length === 0) {
    return await interaction.editReply('Активных эвентов пока нет.');
  }

  const embed = new EmbedBuilder()
    .setColor(0x00BFFF)
    .setTitle('📅 Активные эвенты')
    .setTimestamp();

  for (const event of events) {
    const participantCount = event.participants.length;
    const date = new Date(event.scheduledTime).toLocaleString('ru-RU');

    embed.addFields({
      name: `${event.name} (${event.eventType})`,
      value: `📅 ${date}\n👥 Участников: ${participantCount}/${event.maxParticipants}\n🆔 ID: \`${event._id}\``,
      inline: false
    });
  }

  await interaction.editReply({ embeds: [embed] });
}

// Запись на эвент
async function handleJoinEvent(interaction, user) {
  const eventId = interaction.options.getString('event_id');
  const role = interaction.options.getString('role');

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return await interaction.editReply('Эвент не найден.');
    }

    if (event.status !== 'Набор открыт') {
      return await interaction.editReply('Набор на этот эвент закрыт.');
    }

    // Проверяем, не записан ли пользователь уже
    const existingParticipant = event.participants.find(
      p => p.user.toString() === user._id.toString()
    );

    if (existingParticipant) {
      return await interaction.editReply('Вы уже записаны на этот эвент.');
    }

    // Проверяем лимит участников
    if (event.participants.length >= event.maxParticipants) {
      return await interaction.editReply('Эвент уже набран! Вы можете записаться в резерв.');
    }

    // Проверяем минимальный Gear Score
    if (user.gearScore < event.minGearScore) {
      return await interaction.editReply(
        `У вас недостаточный Gear Score. Требуется: ${event.minGearScore}, у вас: ${user.gearScore}`
      );
    }

    // Добавляем участника
    event.participants.push({
      user: user._id,
      role,
      status: 'Участник'
    });

    await event.save();

    await interaction.editReply(`✅ Вы успешно записались на эвент "${event.name}"!`);

    // Отправляем уведомление в канал эвента
    try {
      const channel = await interaction.guild.channels.fetch(event.channelId);
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('🎉 Новый участник!')
          .setDescription(`${interaction.user.toString()} записался на эвент "${event.name}"`)
          .addFields(
            { name: '🎮 Роль', value: role, inline: true },
            { name: '👥 Всего участников', value: `${event.participants.length}/${event.maxParticipants}`, inline: true }
          )
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Не удалось отправить уведомление:', error);
    }

  } catch (error) {
    console.error('Ошибка записи на эвент:', error);
    await interaction.editReply('Произошла ошибка при записи на эвент.');
  }
}

// Покинуть эвент
async function handleLeaveEvent(interaction, user) {
  const eventId = interaction.options.getString('event_id');

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return await interaction.editReply('Эвент не найден.');
    }

    const participantIndex = event.participants.findIndex(
      p => p.user.toString() === user._id.toString()
    );

    if (participantIndex === -1) {
      return await interaction.editReply('Вы не записаны на этот эвент.');
    }

    event.participants.splice(participantIndex, 1);
    await event.save();

    await interaction.editReply(`✅ Вы покинули эвент "${event.name}".`);

  } catch (error) {
    console.error('Ошибка при выходе из эвента:', error);
    await interaction.editReply('Произошла ошибка при выходе из эвента.');
  }
}

// Отмена эвента
async function handleCancelEvent(interaction, user) {
  const eventId = interaction.options.getString('event_id');

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return await interaction.editReply('Эвент не найден.');
    }

    // Проверяем, что пользователь создал эвент или является офицером+
    const isCreator = event.createdBy.toString() === user._id.toString();
    const isOfficer = user.getPermissionLevel() >= PERMISSION_LEVELS.OFFICER;

    if (!isCreator && !isOfficer) {
      return await interaction.editReply('Вы можете отменять только свои эвенты.');
    }

    event.status = 'Отменено';
    await event.save();

    await interaction.editReply(`✅ Эвент "${event.name}" отменён.`);

  } catch (error) {
    console.error('Ошибка при отмене эвента:', error);
    await interaction.editReply('Произошла ошибка при отмене эвента.');
  }
}
