// scripts/seedTestBorrows.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Media from './models/Media.js';
import Borrow from './models/Borrow.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connecté à MongoDB");

const now = new Date();
const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

try {
    // Nettoyer les anciens tests (optionnel)
    await Borrow.deleteMany({});
    await Media.deleteMany({ title: /Test Média/ });
    await User.deleteMany({ email: /testuser/i });

    const user = await User.create({
        name: 'Test User',
        email: `tomtom.schmidt@hotmail.fr`,
        password: 'password123'
    });

    const media1 = await Media.create({
        title: 'Test Média 1',
        type: 'movie',
        author: 'Auteur 1',
        year: 2020,
        description: 'Media pour test de rappel',
        imageUrl: 'https://example.com/image1.jpg',
        available: false
    });

    const media2 = await Media.create({
        title: 'Test Média 2',
        type: 'book',
        author: 'Auteur 2',
        year: 2018,
        description: 'Media pour test de retard',
        imageUrl: 'https://example.com/image2.jpg',
        available: false
    });

    await Borrow.create([
        {
            user: user._id,
            media: media1._id,
            returnDate: inTwoDays,
            status: 'borrowed'
        },
        {
            user: user._id,
            media: media2._id,
            returnDate: threeDaysAgo,
            status: 'borrowed'
        }
    ]);

    console.log("✅ Données de test insérées avec succès !");
    console.log("📧 Utilisateur:", user.email);
} catch (err) {
    console.error("❌ Erreur d’insertion :", err.message);
} finally {
    await mongoose.disconnect();
}