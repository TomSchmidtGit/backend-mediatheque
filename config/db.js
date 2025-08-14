import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let mongoURI;
    if (process.env.NODE_ENV === 'production') {
      mongoURI = process.env.MONGO_URI_PROD || process.env.MONGO_URI;
    } else {
      mongoURI = process.env.MONGO_URI;
    }

    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    const dbName = mongoURI.split('/').pop().split('?')[0];
    console.log(`🗄️ Base de données: ${dbName}`);
    console.log(`🔗 Environnement: ${process.env.NODE_ENV || 'development'}`);

    // Options de connexion robustes pour Railway
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 secondes pour la sélection du serveur
      socketTimeoutMS: 45000, // 45 secondes pour les opérations socket
      connectTimeoutMS: 30000, // 30 secondes pour la connexion initiale
      maxPoolSize: 10, // Taille maximale du pool de connexions
      minPoolSize: 2, // Taille minimale du pool de connexions
      maxIdleTimeMS: 30000, // Temps maximum d'inactivité
      retryWrites: true,
      retryReads: true,
      w: 'majority', // Écriture majoritaire pour la cohérence
    };

    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB connected successfully');

    // Gestion des événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', err => {
      console.error('🔴 Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB');
    });

    // Gestion de la fermeture gracieuse
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB connection closure:', err);
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB connection closure:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // Sur Railway, on ne veut pas arrêter le processus immédiatement
    // Laisser une chance de reconnexion
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Tentative de reconnexion dans 5 secondes...');
      setTimeout(() => {
        connectDB();
      }, 5000);
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
