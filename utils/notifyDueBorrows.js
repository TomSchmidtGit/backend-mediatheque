import Borrow from '../models/Borrow.js';
import dayjs from 'dayjs';
import { sendDueSoonReminder } from './sendMails/sendDueSoonReminder.js';
import { sendLateReminder } from './sendMails/sendLateReminder.js';
import mongoose from 'mongoose';
import '../models/User.js';
import '../models/Media.js';

export const checkDueBorrows = async () => {
  try {
    // Vérifier que la connexion MongoDB est active
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ Connexion MongoDB non disponible, tâche cron ignorée');
      return;
    }

    const now = dayjs();
    const inTwoDays = now.add(2, 'day').startOf('day');
    const yesterday = now.subtract(1, 'day').endOf('day');

    const borrows = await Borrow.find({ status: 'borrowed' })
      .populate('user')
      .populate('media');

    for (const borrow of borrows) {
      const { user, media, returnDate } = borrow;
      if (!user?.email) continue;

      const returnDay = dayjs(returnDate).startOf('day');
      const formattedDate = returnDay.format('DD/MM/YYYY');

      if (returnDay.isSame(inTwoDays)) {
        await sendDueSoonReminder({ user, media, dueDate: formattedDate });
      } else if (returnDay.isBefore(yesterday)) {
        await sendLateReminder({ user, media, dueDate: formattedDate });
      }
    }

    console.log('✅ Vérification des emprunts terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur dans checkDueBorrows :', error.message);
  }
};
