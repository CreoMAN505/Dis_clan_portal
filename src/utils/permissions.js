import User from '../models/User.js';

/**
 * Проверка прав доступа пользователя
 * @param {string} discordId - ID пользователя в Discord
 * @param {number} requiredLevel - Необходимый уровень прав
 * @returns {Promise<{hasAccess: boolean, user?: any, error?: string}>}
 */
export const checkPermission = async (discordId, requiredLevel) => {
  try {
    const user = await User.findOne({ discordId });

    if (!user) {
      return {
        hasAccess: false,
        error: 'Вы не зарегистрированы в системе. Используйте команду регистрации.'
      };
    }

    if (user.getPermissionLevel() < requiredLevel) {
      return {
        hasAccess: false,
        error: `У вас недостаточно прав. Необходим уровень: ${requiredLevel}, ваш уровень: ${user.getPermissionLevel()}`
      };
    }

    return { hasAccess: true, user };
  } catch (error) {
    console.error('Ошибка проверки прав:', error);
    return {
      hasAccess: false,
      error: 'Произошла ошибка при проверке прав'
    };
  }
};

/**
 * Уровни прав доступа
 */
export const PERMISSION_LEVELS = {
  NEWBIE: 0,      // Новичок
  MEMBER: 1,      // Рядовой
  VETERAN: 2,     // Ветеран
  OFFICER: 3,     // Офицер
  LEADER: 4       // Лидер
};

/**
 * Получить роль по уровню прав
 */
export const getRoleByLevel = (level) => {
  const roles = {
    0: 'Новичок',
    1: 'Рядовой',
    2: 'Ветеран',
    3: 'Офицер',
    4: 'Лидер'
  };
  return roles[level] || 'Новичок';
};
