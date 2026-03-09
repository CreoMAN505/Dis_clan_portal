import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  gameNickname: {
    type: String,
    required: true
  },
  gameClass: {
    type: String,
    enum: ['Воин', 'Маг', 'Хил', 'Лучник', 'Разбойник', 'Другое'],
    required: true
  },
  gearScore: {
    type: Number,
    default: 0
  },
  guildRole: {
    type: String,
    enum: ['Новичок', 'Рядовой', 'Ветеран', 'Офицер', 'Лидер'],
    default: 'Новичок'
  },
  activity: {
    voiceMinutes: {
      type: Number,
      default: 0
    },
    messagesCount: {
      type: Number,
      default: 0
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  builds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Build'
  }]
}, {
  timestamps: true
});

// Метод для получения уровня прав
userSchema.methods.getPermissionLevel = function() {
  const roles = {
    'Новичок': 0,
    'Рядовой': 1,
    'Ветеран': 2,
    'Офицер': 3,
    'Лидер': 4
  };
  return roles[this.guildRole] || 0;
};

// Метод для проверки прав
userSchema.methods.hasPermission = function(requiredLevel) {
  return this.getPermissionLevel() >= requiredLevel;
};

export default mongoose.model('User', userSchema);
