export const returnConfirmationTemplate = ({ name, title, type }) => ({
    subject: '📦 Média retourné avec succès',
    text: `Bonjour ${name},

Nous confirmons la réception du média suivant :

- Titre : ${title}
- Type : ${type}

Merci pour votre ponctualité !

L’équipe Médiathèque`
});
