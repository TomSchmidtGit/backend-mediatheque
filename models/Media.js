import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['book', 'movie', 'music', 'tv'],
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    imageUrl: {
      type: String,
    },
    reviews: [ReviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
    // Nouveaux champs pour les données externes
    externalData: {
      source: {
        type: String,
        enum: ['google_books', 'tmdb', 'musicbrainz', null],
        default: null,
      },
      externalId: {
        type: String,
        default: null,
      },
      externalUrl: {
        type: String,
        default: null,
      },
      isbn: {
        type: String,
        default: null,
      },
      publisher: {
        type: String,
        default: null,
      },
      pageCount: {
        type: Number,
        default: null,
      },
      language: {
        type: String,
        default: null,
      },
      runtime: {
        type: Number,
        default: null,
      },
      genres: [
        {
          type: String,
        },
      ],
      backdropUrl: {
        type: String,
        default: null,
      },
      releaseDate: {
        type: String,
        default: null,
      },
      originalTitle: {
        type: String,
        default: null,
      },
      budget: {
        type: Number,
        default: null,
      },
      revenue: {
        type: Number,
        default: null,
      },
      status: {
        type: String,
        default: null,
      },
      country: {
        type: String,
        default: null,
      },
      barcode: {
        type: String,
        default: null,
      },
      asin: {
        type: String,
        default: null,
      },
      media: [
        {
          format: String,
          trackCount: Number,
          tracks: [
            {
              title: String,
              length: Number,
            },
          ],
        },
      ],
    },
  },
  { timestamps: true }
);

MediaSchema.index({ title: 1 });
MediaSchema.index({ type: 1 });
MediaSchema.index({ 'externalData.source': 1, 'externalData.externalId': 1 });

MediaSchema.methods.updateAverageRating = async function () {
  if (this.reviews.length > 0) {
    this.averageRating =
      this.reviews.reduce((acc, review) => acc + review.rating, 0) /
      this.reviews.length;
  } else {
    this.averageRating = 0;
  }
  await this.save();
};

const Media = mongoose.model('Media', MediaSchema);

export default Media;
