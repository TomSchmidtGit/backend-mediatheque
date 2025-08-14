import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const healthCheck = async () => {
  try {
    const mongoURI = process.env.MONGO_URI_PROD || process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('❌ MONGO_URI environment variable is not defined');
      process.exit(1);
    }

    console.log('🔍 Vérification de la connexion à MongoDB...');

    // Options de connexion pour le health check
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 secondes pour le health check
      connectTimeoutMS: 10000,
    };

    await mongoose.connect(mongoURI, options);

    // Vérifier que la connexion est active
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB connection is healthy');

      // Test d'une opération simple
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📊 Collections disponibles: ${collections.length}`);

      await mongoose.connection.close();
      console.log('✅ Health check completed successfully');
      process.exit(0);
    } else {
      console.error('❌ MongoDB connection is not ready');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
};

// Exécuter le health check
healthCheck();
