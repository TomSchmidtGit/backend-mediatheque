export const lateReminderTemplate = ({ name, title, type, dueDate }) => ({
  subject: '⚠️ Média en retard - action requise',
  text: `Bonjour ${name},

Le média suivant est en retard de retour :

- Titre : ${title}
- Type : ${type}
- Date limite : ${dueDate}

Merci de le rapporter dès que possible. En cas de problème, contactez-nous.

L’équipe Médiathèque`,
});
