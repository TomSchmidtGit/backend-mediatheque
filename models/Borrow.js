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
    dueDate: {
        type: Date,
        default: function() {
            const date = new Date();
            date.setDate(date.getDate() + 14); // 14 jours par défaut
            return date;
        }
    },
    returnDate: {
        type: Date,
        required: false // Seulement requis au moment du retour
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