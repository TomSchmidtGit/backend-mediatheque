import googleBooksService from '../services/googleBooksService.js';
import tmdbService from '../services/tmdbService.js';
import musicBrainzService from '../services/musicBrainzService.js';

// Recherche générale dans toutes les APIs
export const searchExternalMedia = async (req, res) => {
  try {
    const { query, type, maxResults = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        message: 'La requête de recherche doit contenir au moins 2 caractères',
      });
    }

    const searchQuery = query.trim();
    const results = [];

    // Recherche selon le type spécifié ou dans tous les types
    if (!type || type === 'book') {
      try {
        const books = await googleBooksService.searchBooks(
          searchQuery,
          maxResults
        );
        results.push(...books.map(book => ({ ...book, type: 'book' })));
      } catch (error) {
        console.error('Erreur recherche Google Books:', error.message);
      }
    }

    if (!type || type === 'movie') {
      try {
        const movies = await tmdbService.searchMovies(searchQuery, maxResults);
        results.push(...movies.map(movie => ({ ...movie, type: 'movie' })));
      } catch (error) {
        console.error('Erreur recherche TMDB (films):', error.message);
      }
    }

    if (!type || type === 'music') {
      try {
        const releases = await musicBrainzService.searchReleases(
          searchQuery,
          maxResults
        );
        results.push(
          ...releases.map(release => ({ ...release, type: 'music' }))
        );
      } catch (error) {
        console.error('Erreur recherche MusicBrainz:', error.message);
      }
    }

    // Trier les résultats par pertinence (titre qui commence par la requête en premier)
    results.sort((a, b) => {
      const aStartsWithQuery = a.title
        .toLowerCase()
        .startsWith(searchQuery.toLowerCase());
      const bStartsWithQuery = b.title
        .toLowerCase()
        .startsWith(searchQuery.toLowerCase());

      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;

      return 0;
    });

    res.status(200).json({
      success: true,
      data: results,
      total: results.length,
      query: searchQuery,
      type: type || 'all_supported', // Indiquer que c'est tous les types supportés
    });
  } catch (error) {
    console.error('Erreur lors de la recherche externe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche externe',
      error: error.message,
    });
  }
};

// Recherche spécifique par type de média
export const searchBooks = async (req, res) => {
  try {
    const { query, maxResults = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        message: 'La requête de recherche doit contenir au moins 2 caractères',
      });
    }

    const books = await googleBooksService.searchBooks(
      query.trim(),
      maxResults
    );

    res.status(200).json({
      success: true,
      data: books.map(book => ({ ...book, type: 'book' })),
      total: books.length,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de livres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de livres',
      error: error.message,
    });
  }
};

export const searchMovies = async (req, res) => {
  try {
    const { query, maxResults = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        message: 'La requête de recherche doit contenir au moins 2 caractères',
      });
    }

    const movies = await tmdbService.searchMovies(query.trim(), maxResults);

    res.status(200).json({
      success: true,
      data: movies.map(movie => ({ ...movie, type: 'movie' })),
      total: movies.length,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de films:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de films',
      error: error.message,
    });
  }
};

export const searchMusic = async (req, res) => {
  try {
    const { query, maxResults = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        message: 'La requête de recherche doit contenir au moins 2 caractères',
      });
    }

    const releases = await musicBrainzService.searchReleases(
      query.trim(),
      maxResults
    );

    res.status(200).json({
      success: true,
      data: releases.map(release => ({ ...release, type: 'music' })),
      total: releases.length,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de musique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de musique',
      error: error.message,
    });
  }
};

// Récupération d'un média spécifique par ID externe
export const getExternalMediaById = async (req, res) => {
  try {
    const { id, type, source } = req.params;

    if (!id || !type || !source) {
      return res.status(400).json({
        message: 'ID, type et source sont requis',
      });
    }

    let mediaData = null;

    switch (source) {
      case 'google_books':
        if (type === 'book') {
          mediaData = await googleBooksService.getBookById(id);
        }
        break;

      case 'tmdb':
        if (type === 'movie') {
          mediaData = await tmdbService.getMovieById(id);
        } else if (type === 'tv') {
          mediaData = await tmdbService.getTVShowById(id);
        }
        break;

      case 'musicbrainz':
        if (type === 'music') {
          mediaData = await musicBrainzService.getReleaseById(id);
        }
        break;

      default:
        return res.status(400).json({
          message: 'Source non reconnue',
        });
    }

    if (!mediaData) {
      return res.status(404).json({
        message: 'Média non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: { ...mediaData, type },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du média externe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du média externe',
      error: error.message,
    });
  }
};

// Recherche avancée avec filtres
export const advancedSearch = async (req, res) => {
  try {
    const { query, type, author, year, maxResults = 20, source } = req.query;

    if (!query && !author) {
      return res.status(400).json({
        message: 'Au moins une requête ou un auteur doit être fourni',
      });
    }

    const results = [];

    // Recherche par titre
    if (query) {
      if (!type || type === 'book') {
        try {
          const books = await googleBooksService.searchBooksByTitle(
            query,
            maxResults
          );
          results.push(...books.map(book => ({ ...book, type: 'book' })));
        } catch (error) {
          console.error('Erreur recherche livres par titre:', error.message);
        }
      }

      if (!type || type === 'movie') {
        try {
          const movies = await tmdbService.searchMovies(query, maxResults);
          results.push(...movies.map(movie => ({ ...movie, type: 'movie' })));
        } catch (error) {
          console.error('Erreur recherche films par titre:', error.message);
        }
      }

      if (!type || type === 'music') {
        try {
          const releases = await musicBrainzService.searchReleasesByTitle(
            query,
            maxResults
          );
          results.push(
            ...releases.map(release => ({ ...release, type: 'music' }))
          );
        } catch (error) {
          console.error('Erreur recherche musique par titre:', error.message);
        }
      }
    }

    // Recherche par auteur/artiste
    if (author) {
      if (!type || type === 'book') {
        try {
          const books = await googleBooksService.searchBooksByAuthor(
            author,
            maxResults
          );
          results.push(...books.map(book => ({ ...book, type: 'book' })));
        } catch (error) {
          console.error('Erreur recherche livres par auteur:', error.message);
        }
      }

      if (!type || type === 'music') {
        try {
          const releases = await musicBrainzService.searchReleasesByArtist(
            author,
            maxResults
          );
          results.push(
            ...releases.map(release => ({ ...release, type: 'music' }))
          );
        } catch (error) {
          console.error('Erreur recherche musique par artiste:', error.message);
        }
      }
    }

    // Filtrage par année si spécifiée
    let filteredResults = results;
    if (year) {
      const targetYear = parseInt(year);
      if (!isNaN(targetYear)) {
        filteredResults = results.filter(
          item =>
            item.year === targetYear ||
            (item.year && Math.abs(item.year - targetYear) <= 1)
        );
      }
    }

    // Filtrage par source si spécifiée
    if (source) {
      filteredResults = filteredResults.filter(item => item.source === source);
    }

    // Suppression des doublons basée sur l'ID externe
    const uniqueResults = filteredResults.filter(
      (item, index, self) =>
        index === self.findIndex(t => t.externalId === item.externalId)
    );

    res.status(200).json({
      success: true,
      data: uniqueResults,
      total: uniqueResults.length,
      query: query || '',
      author: author || '',
      year: year || '',
      type: type || 'all',
      source: source || 'all',
    });
  } catch (error) {
    console.error('Erreur lors de la recherche avancée:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche avancée',
      error: error.message,
    });
  }
};
