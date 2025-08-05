export const accountDeactivationTemplate = ({ name }) => ({
    subject: '🚫 Compte utilisateur désactivé',
    text: `Bonjour ${name},

Votre compte a été désactivé par un administrateur.

Vous ne pouvez plus accéder à votre espace utilisateur tant que le compte n'est pas réactivé.

Pour plus d’informations, veuillez contacter l’équipe de la médiathèque.

L’équipe Médiathèque`
});