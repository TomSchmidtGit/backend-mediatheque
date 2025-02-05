import mongoose from 'mongoose';

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
    }
}, { timestamps: true });

const Media = mongoose.model('Media', MediaSchema);

export default Media;