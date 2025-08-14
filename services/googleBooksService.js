import axios from 'axios';

class GoogleBooksService {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/books/v1';
    this.apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
  }

  async searchBooks(query, maxResults = 20) {
    try {
      // En mode test, retourner des données factices
      if (process.env.DISABLE_EXTERNAL_APIS === 'true') {
        return [
          {
            id: `test-book-1`,
            title: `Test Book: ${query}`,
            author: 'Test Author',
            description: 'This is a test book for testing purposes',
            year: 2024,
            source: 'google_books',
            externalId: 'test-ext-1',
          },
          {
            id: `test-book-2`,
            title: `Another Test Book: ${query}`,
            author: 'Another Test Author',
            description: 'Another test book for testing purposes',
            year: 2023,
            source: 'google_books',
            externalId: 'test-ext-2',
          },
        ].slice(0, maxResults);
      }

      const response = await axios.get(`${this.baseUrl}/volumes`, {
        params: {
          q: query,
          maxResults: maxResults,
          key: this.apiKey,
        },
      });

      if (!response.data.items) {
        return [];
      }

      return response.data.items.map(item => this.formatBookData(item));
    } catch (error) {
      console.error('Erreur lors de la recherche Google Books:', error.message);
      return [];
    }
  }

  async searchBooksByTitle(title, maxResults = 20) {
    return this.searchBooks(`intitle:${title}`, maxResults);
  }

  async searchBooksByAuthor(author, maxResults = 20) {
    return this.searchBooks(`inauthor:${author}`, maxResults);
  }

  async searchBooksByISBN(isbn) {
    return this.searchBooks(`isbn:${isbn}`, 5);
  }

  async getBookById(bookId) {
    try {
      // En mode test, retourner des données factices
      if (process.env.DISABLE_EXTERNAL_APIS === 'true') {
        return {
          id: bookId,
          title: `Test Book ${bookId}`,
          author: 'Test Author',
          description: 'This is a test book for testing purposes',
          year: 2024,
          source: 'google_books',
          externalId: bookId,
        };
      }

      const response = await axios.get(
        `${this.baseUrl}/volumes/${bookId}?key=${this.apiKey}`
      );
      return this.formatBookData(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération du livre:', error.message);
      return null;
    }
  }

  formatBookData(bookItem) {
    const volumeInfo = bookItem.volumeInfo;
    const imageLinks = volumeInfo.imageLinks || {};

    return {
      id: bookItem.id,
      title: volumeInfo.title || 'Titre inconnu',
      author: volumeInfo.authors
        ? volumeInfo.authors.join(', ')
        : 'Auteur inconnu',
      year: volumeInfo.publishedDate
        ? new Date(volumeInfo.publishedDate).getFullYear()
        : null,
      description: volumeInfo.description || '',
      imageUrl: imageLinks.thumbnail || imageLinks.smallThumbnail || null,
      isbn: volumeInfo.industryIdentifiers
        ? volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')
            ?.identifier ||
          volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')
            ?.identifier
        : null,
      publisher: volumeInfo.publisher || '',
      pageCount: volumeInfo.pageCount || null,
      language: volumeInfo.language || '',
      categories: volumeInfo.categories || [],
      averageRating: volumeInfo.averageRating || null,
      ratingsCount: volumeInfo.ratingsCount || 0,
      previewLink: volumeInfo.previewLink || null,
      infoLink: volumeInfo.infoLink || null,
      source: 'google_books',
      externalId: bookItem.id,
    };
  }
}

export default new GoogleBooksService();
