import mongoose from 'mongoose';

const BorrowSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    media: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true
    },
    borrowDate: {
        type: Date,
        default: Date.now
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['borrowed', 'returned', 'overdue'],
        default: 'borrowed'
    }
}, { timestamps: true });

BorrowSchema.index({ user: 1 });
BorrowSchema.index({ media: 1 });

const Borrow = mongoose.model('Borrow', BorrowSchema);

export default Borrow;