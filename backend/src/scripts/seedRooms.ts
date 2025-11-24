import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Room } from '../models/Room';

dotenv.config();

const rooms = [
  { name: 'Sunshine Suite', city: 'Miami', country: 'USA', capacity: 2 },
  { name: 'Ocean View Deluxe', city: 'Miami', country: 'USA', capacity: 4 },
  { name: 'Manhattan Penthouse', city: 'New York', country: 'USA', capacity: 6 },
  { name: 'Brooklyn Loft', city: 'New York', country: 'USA', capacity: 3 },
  { name: 'Golden Gate Room', city: 'San Francisco', country: 'USA', capacity: 2 },
  { name: 'Pacific Heights Suite', city: 'San Francisco', country: 'USA', capacity: 4 },
  { name: 'London Bridge Suite', city: 'London', country: 'UK', capacity: 2 },
  { name: 'Westminster Palace Room', city: 'London', country: 'UK', capacity: 5 },
  { name: 'Eiffel Tower View', city: 'Paris', country: 'France', capacity: 3 },
  { name: 'Champs-Élysées Luxury', city: 'Paris', country: 'France', capacity: 4 },
  { name: 'Shibuya Modern', city: 'Tokyo', country: 'Japan', capacity: 2 },
  { name: 'Shinjuku Executive', city: 'Tokyo', country: 'Japan', capacity: 6 },
  { name: 'Sydney Harbor Room', city: 'Sydney', country: 'Australia', capacity: 4 },
  { name: 'Opera House View', city: 'Sydney', country: 'Australia', capacity: 2 },
  { name: 'Berlin Wall Suite', city: 'Berlin', country: 'Germany', capacity: 3 },
  { name: 'Brandenburg Gate Deluxe', city: 'Berlin', country: 'Germany', capacity: 5 },
  { name: 'Copacabana Beach Room', city: 'Rio de Janeiro', country: 'Brazil', capacity: 2 },
  { name: 'Christ Redeemer View', city: 'Rio de Janeiro', country: 'Brazil', capacity: 4 },
  { name: 'Marina Bay Suite', city: 'Singapore', country: 'Singapore', capacity: 3 },
  { name: 'Gardens Executive', city: 'Singapore', country: 'Singapore', capacity: 6 }
];

async function seedRooms() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/roombooking';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if rooms already exist
    const existingRoomsCount = await Room.countDocuments();
    if (existingRoomsCount > 0) {
      console.log(`Database already has ${existingRoomsCount} rooms. Skipping seed.`);
      console.log('To re-seed, manually clear the rooms collection first.');
      return;
    }

    console.log('Database is empty. Inserting seed rooms...');
    const inserted = await Room.insertMany(rooms);
    console.log('Successfully inserted ' + inserted.length + ' rooms');

    console.log('\nSeed completed successfully!');
  } catch (error) {
    console.error('Error seeding rooms:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

seedRooms();
