export const borrowConfirmationTemplate = ({ name, title, type, dueDate }) => ({
    subject: '✅ Emprunt confirmé',
    text: `Bonjour ${name},
  
  Vous avez emprunté le média suivant :
  
  - Titre : ${title}
  - Type : ${type}
  - À retourner avant le : ${dueDate}
  
  Bon visionnage / lecture / écoute !
  
  L’équipe Médiathèque`
  });  