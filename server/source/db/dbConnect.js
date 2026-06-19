import mongoose from 'mongoose';
import apiError from '../utils/apiError.js';

const dbConnect = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(`${process.env.MONGO_URL}/${process.env.MONGO_NAME}`);
    console.log('Connected to MongoDB');
  } catch (error) {
    throw new apiError('Database connection failed', 500, error); 
  }
};

export default dbConnect;
