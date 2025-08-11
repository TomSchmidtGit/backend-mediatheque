import cron from 'node-cron';
import { checkDueBorrows } from './notifyDueBorrows.js';

export const scheduleBorrowReminders = () => {
  

  // Tous les jours à 9h00
  cron.schedule('0 9 * * *', async () => {
  
    await checkDueBorrows();
  }, {
    timezone: 'Europe/Paris'
  });
};