import mongoose from 'mongoose';
import 'dotenv/config';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');
  try {
    await mongoose.connection.collection('certifications').dropIndexes();
    console.log('Indexes dropped');
  } catch (e) {
    console.error('Error dropping indexes', e);
  }
  await mongoose.disconnect();
}
run();
