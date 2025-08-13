export const dueSoonReminderTemplate = ({ name, title, type, dueDate }) => ({
  subject: '📅 Votre retour de média approche !',
  text: `Bonjour ${name},

Petit rappel : vous devez retourner le média suivant avant le ${dueDate} :

- Titre : ${title}
- Type : ${type}

Pensez à le rapporter à temps pour éviter toute pénalité.

Merci,
L’équipe Médiathèque`,
});
