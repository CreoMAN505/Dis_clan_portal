import User from '../models/User.js';

export default {
  name: 'voiceStateUpdate',

  async execute(oldState, newState) {
    // Игнорируем ботов
    if (newState.member.user.bot) return;

    try {
      const user = await User.findOne({ discordId: newState.member.id });

      if (!user) return;

      // Пользователь зашёл в голосовой канал
      if (!oldState.channel && newState.channel) {
        // Записываем время входа
        user.activity.lastVoiceJoin = Date.now();
        await user.save();
      }
      // Пользователь вышел из голосового канала
      else if (oldState.channel && !newState.channel) {
        // Если было записано время входа, считаем разницу
        if (user.activity.lastVoiceJoin) {
          const joinTime = user.activity.lastVoiceJoin;
          const leaveTime = Date.now();
          const minutesInVoice = Math.floor((leaveTime - joinTime) / 60000);

          // Обновляем общее количество минут
          user.activity.voiceMinutes += minutesInVoice;
          user.activity.lastVoiceJoin = null;
          user.activity.lastSeen = new Date();
          await user.save();
        }
      }
    } catch (error) {
      console.error('Ошибка при обработке голосового состояния:', error);
    }
  }
};
