import Borrow from '../models/Borrow.js';
import dayjs from 'dayjs';
import { sendDueSoonReminder } from './sendMails/sendDueSoonReminder.js';
import { sendLateReminder } from './sendMails/sendLateReminder.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import '../models/User.js';
import '../models/Media.js';

dotenv.config();

export const checkDueBorrows = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

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
        console.log(`📧 Rappel 2 jours avant envoyé à ${user.email} pour ${media.title}`);
      } else if (returnDay.isBefore(yesterday)) {
        await sendLateReminder({ user, media, dueDate: formattedDate });
        console.log(`📧 Rappel de retard envoyé à ${user.email} pour ${media.title}`);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur dans checkDueBorrows :', error.message);
    await mongoose.disconnect();
  }
};