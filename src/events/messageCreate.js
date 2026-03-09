import User from '../models/User.js';

export default {
  name: 'messageCreate',

  async execute(message) {
    // Игнорируем ботов и DM
    if (message.author.bot || !message.guild) return;

    try {
      const user = await User.findOne({ discordId: message.author.id });

      if (user) {
        // Увеличиваем счётчик сообщений
        user.activity.messagesCount += 1;
        user.activity.lastSeen = new Date();
        await user.save();
      }
    } catch (error) {
      console.error('Ошибка при обработке сообщения:', error);
    }
  }
};
