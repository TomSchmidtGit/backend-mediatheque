import cron from 'node-cron';
import { checkDueBorrows } from './notifyDueBorrows.js';

export const scheduleBorrowReminders = () => {
  // Chaque minute (pour test)
  // cron.schedule('* * * * *', async () => {
  //   console.log('⏰ Test CRON : vérification immédiate');
  //   await checkDueBorrows();
  // });

  // Tous les jours à 9h00
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ CRON : vérification des emprunts à 9h00');
    await checkDueBorrows();
  }, {
    timezone: 'Europe/Paris'
  });
};