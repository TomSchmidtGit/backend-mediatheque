import axios from 'axios';

class TMDBService {
  constructor() {
    this.baseUrl = 'https://api.themoviedb.org/3';
    this.apiKey = process.env.TMDB_API_KEY || '';
    this.imageBaseUrl = 'https://image.tmdb.org/t/p';
    this.cache = new Map(); // Cache simple pour éviter les appels répétés
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Méthode pour nettoyer le cache expiré
  _cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  // Méthode pour obtenir un élément du cache
  _getFromCache(key) {
    this._cleanCache();
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Méthode pour mettre en cache
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  async searchMovies(query, maxResults = 20) {
    try {
      // En mode test, retourner des données factices
      if (process.env.DISABLE_EXTERNAL_APIS === 'true') {
        return [
          {
            id: `test-movie-1`,
            title: `Test Movie: ${query}`,
            author: 'Test Director',
            description: 'This is a test movie for testing purposes',
            year: 2024,
            source: 'tmdb',
            externalId: 'test-ext-1',
          },
          {
            id: `test-movie-2`,
            title: `Another Test Movie: ${query}`,
            author: 'Another Test Director',
            description: 'Another test movie for testing purposes',
            year: 2023,
            source: 'tmdb',
            externalId: 'test-ext-2',
          },
        ].slice(0, maxResults);
      }

      const response = await axios.get(`${this.baseUrl}/search/movie`, {
        params: {
          query: query,
          api_key: this.apiKey,
          language: 'fr-FR',
        },
      });

      if (!response.data.results) {
        return [];
      }

      // Récupérer les détails complets pour chaque film (avec crédits)
      const moviesWithCredits = await Promise.all(
        response.data.results.slice(0, maxResults).map(async movie => {
          try {
            const movieDetails = await this.getMovieById(movie.id);
            return movieDetails;
          } catch (error) {
            console.error(
              `Erreur lors de la récupération des détails du film ${movie.id}:`,
              error.message
            );
            // Fallback vers les données de base si la récupération des détails échoue
            return this.formatMovieData(movie);
          }
        })
      );

      return moviesWithCredits.filter(movie => movie !== null);
    } catch (error) {
      console.error('Erreur lors de la recherche TMDB (films):', error.message);
      return [];
    }
  }

  async searchMulti(query, maxResults = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/search/multi`, {
        params: {
          api_key: this.apiKey,
          query,
          language: 'fr-FR',
          page: 1,
        },
      });

      if (!response.data.results) {
        return [];
      }

      const results = response.data.results
        .filter(item => item.media_type === 'movie')
        .slice(0, maxResults);

      return results.map(item => this.formatMovieData(item));
    } catch (error) {
      console.error('Erreur lors de la recherche TMDB (multi):', error.message);
      return [];
    }
  }

  async getMovieById(movieId) {
    try {
      // En mode test, retourner des données factices
      if (process.env.DISABLE_EXTERNAL_APIS === 'true') {
        return {
          id: movieId,
          title: `Test Movie ${movieId}`,
          author: 'Test Director',
          description: 'This is a test movie for testing purposes',
          year: 2024,
          source: 'tmdb',
          externalId: movieId,
        };
      }

      const response = await axios.get(`${this.baseUrl}/movie/${movieId}`, {
        params: {
          api_key: this.apiKey,
          language: 'fr-FR',
          append_to_response: 'credits',
        },
      });

      const movieData = this.formatMovieData(response.data);

      // Mettre en cache
      const cacheKey = `movie_${movieId}`;
      this._setCache(cacheKey, movieData);

      return movieData;
    } catch (error) {
      console.error('Erreur lors de la récupération du film:', error.message);
      return null;
    }
  }

  formatMovieData(movieItem) {
    const credits = movieItem.credits || {};
    const director = credits.crew
      ? credits.crew.find(person => person.job === 'Director')?.name
      : null;

    return {
      id: movieItem.id,
      title: movieItem.title || movieItem.name || 'Titre inconnu',
      author: director || 'Réalisateur inconnu',
      year: movieItem.release_date
        ? new Date(movieItem.release_date).getFullYear()
        : null,
      description: movieItem.overview || '',
      imageUrl: movieItem.poster_path
        ? `${this.imageBaseUrl}/w500${movieItem.poster_path}`
        : null,
      backdropUrl: movieItem.backdrop_path
        ? `${this.imageBaseUrl}/w1280${movieItem.backdrop_path}`
        : null,
      runtime: movieItem.runtime || null,
      genres: movieItem.genres ? movieItem.genres.map(g => g.name) : [],
      averageRating: movieItem.vote_average || null,
      ratingsCount: movieItem.vote_count || 0,
      releaseDate: movieItem.release_date || null,
      originalTitle: movieItem.original_title || null,
      language: movieItem.original_language || null,
      budget: movieItem.budget || null,
      revenue: movieItem.revenue || null,
      source: 'tmdb',
      mediaType: 'movie',
      externalId: movieItem.id,
    };
  }
}

export default new TMDBService();
