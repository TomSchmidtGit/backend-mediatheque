import mongoose from 'mongoose';

const PasswordResetTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 3600 // Expire après 1 heure
    }
}, { timestamps: true });

// Index pour améliorer les performances
PasswordResetTokenSchema.index({ email: 1, token: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);

export default PasswordResetToken;
