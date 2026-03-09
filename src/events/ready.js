export default {
  name: 'ready',
  once: true,

  async execute(client) {
    console.log(`✅ Бот ${client.user.tag} успешно запущен!`);
    console.log(`📊 Серверов: ${client.guilds.cache.size}`);
    console.log(`👥 Пользователей: ${client.users.cache.size}`);

    // Устанавливаем статус бота
    client.user.setPresence({
      activities: [{ name: '/profile | /roster', type: 'WATCHING' }],
      status: 'online'
    });
  }
};
