import { SlashCommandBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('build')
    .setDescription('Управление билдами')
    .addSubcommand(subcommand =>
      subcommand
        .setName('search')
        .setDescription('Найти билды по классу')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Добавить новый билд')
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const { checkPermission } = await import('../../utils/permissions.js');
    const PERMISSION_LEVELS = (await import('../../utils/permissions.js')).PERMISSION_LEVELS;

    if (interaction.options.getSubcommand() === 'search') {
      // Выпадающее меню для поиска билдов
      const select = new StringSelectMenuBuilder()
        .setCustomId('build_class_select')
        .setPlaceholder('Выбери класс')
        .addOptions(
          { label: 'Воин', value: 'Воин', description: 'Билды для воина' },
          { label: 'Маг', value: 'Маг', description: 'Билды для мага' },
          { label: 'Хил', value: 'Хил', description: 'Билды для хила' },
          { label: 'Лучник', value: 'Лучник', description: 'Билды для лучника' },
          { label: 'Разбойник', value: 'Разбойник', description: 'Билды для разбойника' }
        );

      // Создаём ActionRow для селекта
      const row = {
        type: 1,
        components: [select]
      };

      await interaction.editReply({
        content: '🔍 Выберите класс для поиска билдов:',
        components: [row]
      });

    } else if (interaction.options.getSubcommand() === 'add') {
      // Проверка прав - только Ветеран и выше могут добавлять билды
      const result = await checkPermission(interaction.user.id, PERMISSION_LEVELS.VETERAN);

      if (!result.hasAccess) {
        return await interaction.editReply({ content: result.error, ephemeral: true });
      }

      // Показываем модальное окно для добавления билда
      const { default: showBuildModal } = await import('../../modals/buildModal.js');
      await showBuildModal(interaction);
    }
  }
};
