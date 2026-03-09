import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  eventType: {
    type: String,
    enum: ['PvE', 'PvP', 'Raid', 'Донжон', 'Другое'],
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Танк', 'Хил', 'DPS', 'DPS/Хил', 'Танк/Хил'],
      default: 'DPS'
    },
    status: {
      type: String,
      enum: ['Участник', 'Резерв', 'Под вопросом'],
      default: 'Участник'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxParticipants: {
    type: Number,
    default: 10
  },
  minGearScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Запланировано', 'Набор открыт', 'В процессе', 'Завершено', 'Отменено'],
    default: 'Набор открыт'
  },
  channelId: {
    type: String,
    required: true
  },
  messageId: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Event', eventSchema);
