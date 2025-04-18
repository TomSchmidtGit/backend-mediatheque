import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const MediaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['book', 'movie', 'music'],
        required: true
    },
    author: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String
    },
    reviews: [ReviewSchema],
    averageRating: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

MediaSchema.index({ title: 1 });
MediaSchema.index({ type: 1 });

MediaSchema.methods.updateAverageRating = async function () {
    if (this.reviews.length > 0) {
        this.averageRating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
    } else {
        this.averageRating = 0;
    }
    await this.save();
};

const Media = mongoose.model('Media', MediaSchema);

export default Media;