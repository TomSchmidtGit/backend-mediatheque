// Utilitaires pour les traductions de types de médias
export const translateType = (type) => {
  const typeTranslations = {
    'book': 'Livre',
    'movie': 'Film',
    'music': 'Musique'
  };
  return typeTranslations[type] || type;
};
