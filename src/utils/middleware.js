/**
 * Middleware для Slash команд
 * Проверяет права перед выполнением команды
 */
export const withPermission = (requiredLevel) => {
  return async (target, thisArg, argumentsList) => {
    const [interaction] = argumentsList;
    const { checkPermission } = await import('../utils/permissions.js');

    const result = await checkPermission(interaction.user.id, requiredLevel);

    if (!result.hasAccess) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: result.error, ephemeral: true });
      } else {
        await interaction.reply({ content: result.error, ephemeral: true });
      }
      return false;
    }

    // Добавляем пользователя в объект interaction для дальнейшего использования
    interaction.userData = result.user;
    return true;
  };
};
