import { EmbedBuilder } from 'discord.js';
import User from '../models/User.js';

export default {
  name: 'interactionCreate',

  async execute(interaction) {
    // Обработка Slash команд
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`Команда ${interaction.commandName} не найдена!`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Ошибка выполнения команды ${interaction.commandName}:`, error);

        const errorMessage = {
          content: 'Произошла ошибка при выполнении команды!',
          ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }
    }

    // Обработка кнопок
    else if (interaction.isButton()) {
      if (interaction.customId === 'register_button') {
        const modalHandler = interaction.client.modals.get('registration_modal');
        if (modalHandler) {
          await modalHandler.execute(interaction);
        }
      } else if (interaction.customId.startsWith('event_join_')) {
        const { showEventRoleSelect } = await import('../utils/eventHelpers.js');
        await showEventRoleSelect(interaction);
      } else if (interaction.customId.startsWith('event_info_')) {
        const { showEventInfo } = await import('../utils/eventHelpers.js');
        await showEventInfo(interaction);
      }
    }

    // Обработка модальных окон
    else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'registration_modal') {
        await handleRegistration(interaction);
      } else if (interaction.customId === 'add_build_modal') {
        await handleAddBuild(interaction);
      } else if (interaction.customId === 'create_event_modal') {
        await handleCreateEvent(interaction);
      }
    }

    // Обработка селект-меню
    else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'build_class_select') {
        await handleBuildSearch(interaction);
      } else if (interaction.customId.startsWith('event_role_select_')) {
        const { handleRoleSelect } = await import('../utils/eventHelpers.js');
        await handleRoleSelect(interaction);
      }
    }
  }
};

// Обработка регистрации
async function handleRegistration(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const gameNickname = interaction.fields.getTextInputValue('game_nickname');
  const gameClass = interaction.fields.getTextInputValue('game_class');
  const gearScore = parseInt(interaction.fields.getTextInputValue('gear_score')) || 0;
  const about = interaction.fields.getTextInputValue('about') || 'Нет информации';

  // Проверяем, что класс корректный
  const validClasses = ['Воин', 'Маг', 'Хил', 'Лучник', 'Разбойник', 'Другое'];
  const normalizedClass = validClasses.find(c => c.toLowerCase() === gameClass.toLowerCase()) || 'Другое';

  // Проверяем, не зарегистрирован ли пользователь
  const existingUser = await User.findOne({ discordId: interaction.user.id });

  if (existingUser) {
    return await interaction.editReply('Вы уже зарегистрированы в системе!');
  }

  // Создаём нового пользователя
  const newUser = new User({
    discordId: interaction.user.id,
    gameNickname,
    gameClass: normalizedClass,
    gearScore,
    guildRole: 'Новичок'
  });

  await newUser.save();

  // Меняем ник в Discord
  try {
    await interaction.member.setNickname(gameNickname);
  } catch (error) {
    console.error('Не удалось изменить ник:', error);
  }

  // Создаём Embed для лог-канала
  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('🎉 Новая регистрация!')
    .setThumbnail(interaction.user.displayAvatarURL())
    .addFields(
      { name: '👤 Discord', value: interaction.user.toString(), inline: true },
      { name: '🎮 Игровой ник', value: gameNickname, inline: true },
      { name: '⚔️ Класс', value: normalizedClass, inline: true },
      { name: '💪 Gear Score', value: gearScore.toString(), inline: true },
      { name: '📝 О себе', value: about, inline: false }
    )
    .setTimestamp();

  // Ищем канал для логов (можно настроить через команду)
  const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'регистрации-лог' || ch.name === 'регистрации');

  if (logChannel) {
    await logChannel.send({ embeds: [embed] });
  }

  await interaction.editReply('✅ Поздравляем! Вы успешно зарегистрированы в гильдии. Добро пожаловать!');
}

// Обработка добавления билда
async function handleAddBuild(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const name = interaction.fields.getTextInputValue('build_name');
  const gameClass = interaction.fields.getTextInputValue('build_class');
  const link = interaction.fields.getTextInputValue('build_link');
  const description = interaction.fields.getTextInputValue('build_description') || '';

  const Build = (await import('../models/Build.js')).default;
  const User = (await import('../models/User.js')).default;

  const user = await User.findOne({ discordId: interaction.user.id });

  if (!user) {
    return await interaction.editReply('Вы не зарегистрированы в системе.');
  }

  const newBuild = new Build({
    name,
    class: gameClass,
    author: user._id,
    description,
    link
  });

  await newBuild.save();

  // Добавляем билд в профиль пользователя
  user.builds.push(newBuild._id);
  await user.save();

  await interaction.editReply(`✅ Билд "${name}" успешно добавлен!`);
}

// Обработка поиска билдов
async function handleBuildSearch(interaction) {
  await interaction.deferReply();

  const selectedClass = interaction.values[0];
  const Build = (await import('../models/Build.js')).default;

  const builds = await Build.find({ class: selectedClass }).populate('author');

  if (builds.length === 0) {
    return await interaction.editReply(`Билдов для класса ${selectedClass} пока нет.`);
  }

  const embed = {
    color: 0x00BFFF,
    title: `🔍 Билды: ${selectedClass}`,
    fields: builds.map(build => ({
      name: build.name,
      value: `[Ссылка](${build.link})\nАвтор: ${build.author.gameNickname}\n${build.description ? build.description : ''}`,
      inline: false
    })),
    timestamp: new Date()
  };

  await interaction.editReply({ embeds: [embed] });
}

// Обработка создания эвента
async function handleCreateEvent(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const name = interaction.fields.getTextInputValue('event_name');
  const type = interaction.fields.getTextInputValue('event_type');
  const dateStr = interaction.fields.getTextInputValue('event_date');
  const maxParticipants = parseInt(interaction.fields.getTextInputValue('max_participants')) || 10;
  const minGearScore = parseInt(interaction.fields.getTextInputValue('min_gear_score')) || 0;
  const description = interaction.fields.getTextInputValue('event_description') || '';

  // Парсим дату
  const scheduledTime = new Date(dateStr.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1'));

  if (isNaN(scheduledTime.getTime())) {
    return await interaction.editReply('Неверный формат даты. Используйте формат: ДД.ММ.ГГГГ ЧЧ:ММ');
  }

  const Event = (await import('../models/Event.js')).default;
  const User = (await import('../models/User.js')).default;

  const user = await User.findOne({ discordId: interaction.user.id });

  if (!user) {
    return await interaction.editReply('Вы не зарегистрированы в системе.');
  }

  const newEvent = new Event({
    name,
    eventType: type,
    scheduledTime,
    createdBy: user._id,
    maxParticipants,
    minGearScore,
    description,
    channelId: interaction.channelId,
    status: 'Набор открыт'
  });

  await newEvent.save();

  // Создаём красивое сообщение об эвенте
  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle(`🎉 ${name}`)
    .setDescription(description || 'Нет описания')
    .addFields(
      { name: '📅 Дата', value: scheduledTime.toLocaleString('ru-RU'), inline: true },
      { name: '🎮 Тип', value: type, inline: true },
      { name: '💪 Мин. GS', value: minGearScore.toString(), inline: true },
      { name: '👥 Участников', value: `0/${maxParticipants}`, inline: true },
      { name: '🆔 ID', value: `\`${newEvent._id}\``, inline: true }
    )
    .setFooter({ text: 'Запись: /event join' })
    .setTimestamp();

  // Добавляем кнопки для записи
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`event_join_${newEvent._id}`)
        .setLabel('✅ Записаться')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`event_info_${newEvent._id}`)
        .setLabel('ℹ️ Инфо')
        .setStyle(ButtonStyle.Primary)
    );

  const message = await interaction.channel.send({
    content: '@everyone Новый эвент!',
    embeds: [embed],
    components: [row]
  });

  // Сохраняем ID сообщения
  newEvent.messageId = message.id;
  await newEvent.save();

  await interaction.editReply(`✅ Эвент "${name}" успешно создан!`);
}
