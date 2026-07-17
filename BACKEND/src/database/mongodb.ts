import mongoose from 'mongoose';
import { DB_NAME } from '../config/constant';

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediconnect_test', {
    dbName: DB_NAME,
  });
  console.log('MongoDB connected');
};