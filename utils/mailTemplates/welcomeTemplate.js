const welcomeTemplate = ({ name }) => ({
    subject: '🎉 Bienvenue à la Médiathèque',
    text: `Bonjour ${name},
  
  Bienvenue sur la plateforme Médiathèque !
  
  Votre compte a été créé avec succès. Vous pouvez dès maintenant :
  - Explorer notre collection de livres, films et musiques.
  - Emprunter et réserver les ressources disponibles.
  - Suivre vos emprunts et retours depuis votre espace personnel.
  
  Nous sommes ravis de vous accueillir parmi nos utilisateurs !
  
  À très bientôt,
  L’équipe Médiathèque`
  });
  
  export default welcomeTemplate;
  