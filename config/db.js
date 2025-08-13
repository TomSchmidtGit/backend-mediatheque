import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let mongoURI;
    if (process.env.NODE_ENV === 'production') {
      mongoURI = process.env.MONGO_URI_PROD || process.env.MONGO_URI;
    } else {
      mongoURI = process.env.MONGO_URI;
    }

    const dbName = mongoURI.split('/').pop().split('?')[0];
    console.log(`🗄️ Base de données: ${dbName}`);
    console.log(`🔗 Environnement: ${process.env.NODE_ENV || 'development'}`);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
