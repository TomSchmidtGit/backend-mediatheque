import axios from 'axios';

class MusicBrainzService {
  constructor() {
    this.baseUrl = 'https://musicbrainz.org/ws/2';
    this.userAgent = 'MediathequeApp/1.0.0 (contact@example.com)';
  }

  async searchReleases(query, maxResults = 20) {
    try {
      // En mode test, retourner des données factices
      if (process.env.DISABLE_EXTERNAL_APIS === 'true') {
        return [
          {
            id: `test-music-1`,
            title: `Test Album: ${query}`,
            author: 'Test Artist',
            description: 'This is a test music album for testing purposes',
            year: 2024,
            source: 'musicbrainz',
            externalId: 'test-ext-1',
          },
          {
            id: `test-music-2`,
            title: `Another Test Album: ${query}`,
            author: 'Another Test Artist',
            description: 'Another test music album for testing purposes',
            year: 2023,
            source: 'musicbrainz',
            externalId: 'test-ext-2',
          },
        ].slice(0, maxResults);
      }

      const response = await axios.get(`${this.baseUrl}/release`, {
        params: {
          query: query,
          limit: maxResults,
          fmt: 'json',
        },
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (!response.data.releases) {
        return [];
      }

      return response.data.releases.map(release =>
        this.formatReleaseData(release)
      );
    } catch (error) {
      console.error('Erreur lors de la recherche MusicBrainz:', error.message);
      return [];
    }
  }

  async searchReleasesByTitle(title, maxResults = 20) {
    return this.searchReleases(`title:"${title}"`, maxResults);
  }

  async searchReleasesByArtist(artist, maxResults = 20) {
    return this.searchReleases(`artist:"${artist}"`, maxResults);
  }

  async searchReleasesByAlbum(album, maxResults = 20) {
    return this.searchReleases(`release:"${album}"`, maxResults);
  }

  async getReleaseById(releaseId) {
    try {
      // En mode test, retourner des données factices
      if (process.env.DISABLE_EXTERNAL_APIS === 'true') {
        return {
          id: releaseId,
          title: `Test Album ${releaseId}`,
          author: 'Test Artist',
          description: 'This is a test music album for testing purposes',
          year: 2024,
          source: 'musicbrainz',
          externalId: releaseId,
        };
      }

      const response = await axios.get(`${this.baseUrl}/release/${releaseId}`, {
        params: {
          inc: 'artists+recordings+media+tags+genres',
          fmt: 'json',
        },
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      return this.formatReleaseData(response.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'album:",
        error.message
      );
      return null;
    }
  }

  async searchArtists(query, maxResults = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/artist`, {
        params: {
          query,
          limit: maxResults,
          fmt: 'json',
        },
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (!response.data.artists) {
        return [];
      }

      return response.data.artists.map(artist => this.formatArtistData(artist));
    } catch (error) {
      console.error("Erreur lors de la recherche d'artistes:", error.message);
      return [];
    }
  }

  async getArtistById(artistId) {
    try {
      const response = await axios.get(`${this.baseUrl}/artist/${artistId}`, {
        params: {
          inc: 'releases+tags+genres',
          fmt: 'json',
        },
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      return this.formatArtistData(response.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'artiste:",
        error.message
      );
      return null;
    }
  }

  formatReleaseData(release) {
    const artistCredit = release['artist-credit'] || [];
    const artistName =
      artistCredit.length > 0
        ? artistCredit.map(ac => ac.name || ac.artist?.name).join(', ')
        : 'Artiste inconnu';

    const date = release.date || release['release-events']?.[0]?.date;
    const year = date ? new Date(date).getFullYear() : null;

    const coverArtUrl = release.id
      ? `https://coverartarchive.org/release/${release.id}/front-500`
      : null;

    return {
      id: release.id,
      title: release.title || 'Titre inconnu',
      author: artistName,
      year: year,
      description: release.disambiguation || '',
      imageUrl: coverArtUrl,
      artistId: artistCredit[0]?.artist?.id || null,
      artistName: artistName,
      releaseDate: date || null,
      country: release.country || null,
      status: release.status || null,
      packaging: release.packaging || null,
      language: release.language || null,
      barcode: release.barcode || null,
      asin: release.asin || null,
      genres: release.genres ? release.genres.map(g => g.name) : [],
      tags: release.tags ? release.tags.map(t => t.name) : [],
      media: release.media
        ? release.media.map(m => ({
            format: m.format,
            trackCount: m['track-count'],
            tracks: m.tracks
              ? m.tracks.map(t => ({
                  title: t.title,
                  length: t.length,
                }))
              : [],
          }))
        : [],
      source: 'musicbrainz',
      externalId: release.id,
    };
  }

  formatArtistData(artist) {
    const beginDate = artist['begin-area']?.name || artist['life-span']?.begin;
    const endDate = artist['end-area']?.name || artist['life-span']?.end;
    const year = beginDate ? new Date(beginDate).getFullYear() : null;

    return {
      id: artist.id,
      name: artist.name || 'Nom inconnu',
      sortName: artist['sort-name'] || artist.name,
      type: artist.type || null,
      gender: artist.gender || null,
      country: artist.country || null,
      year: year,
      beginDate: beginDate,
      endDate: endDate,
      description: artist.disambiguation || '',
      genres: artist.genres ? artist.genres.map(g => g.name) : [],
      tags: artist.tags ? artist.tags.map(t => t.name) : [],
      releases: artist.releases
        ? artist.releases.map(r => ({
            id: r.id,
            title: r.title,
            date: r.date,
          }))
        : [],
      source: 'musicbrainz',
      externalId: artist.id,
    };
  }

  // Méthode utilitaire pour obtenir l'image de couverture via Cover Art Archive
  async getCoverArtUrl(releaseId, size = 'front-500') {
    try {
      const response = await axios.get(
        `https://coverartarchive.org/release/${releaseId}`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
        }
      );

      if (response.data.images && response.data.images.length > 0) {
        const frontCover = response.data.images.find(img => img.front);
        if (frontCover) {
          return frontCover.image;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

export default new MusicBrainzService();
