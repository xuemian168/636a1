const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Room } = require("../models/Room");
const User = require("../models/User");

const initializeData = async () => {
  try {
    await Room.deleteMany({});
    await User.deleteMany({});

    // Create admin account
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@qut.com',
      password: 'admin123', 
      roll: 'admin',
      id_type: 'passport',      
      id_number: 'AD123456', 
      phone: '0123456789'
    });

    // Create sample rooms
    const rooms = await Room.create([
      {
        name: 'Deluxe Ocean View',
        roomNumber: '501',
        maxPeople: 2,
        price: 299,
        description: 'Luxurious room with stunning ocean views',
        roomType: 'Deluxe',
        amenities: ['Ocean View', 'King Bed', 'Mini Bar', 'WiFi', 'Bath Tub'],
        size: 45,
        floor: 5,
        images: ['/images/rooms/deluxe-ocean.jpg']
      },
      {
        name: 'Executive Suite',
        roomNumber: '601',
        maxPeople: 4,
        price: 499,
        description: 'Spacious suite with separate living area',
        roomType: 'Suite',
        amenities: ['City View', 'King Bed', 'Living Room', 'Kitchen', 'WiFi'],
        size: 75,
        floor: 6,
        images: ['/images/rooms/executive-suite.jpg']
      },
      {
        name: 'Standard Double',
        roomNumber: '201',
        maxPeople: 2,
        price: 159,
        description: 'Comfortable room with modern amenities',
        roomType: 'Double',
        amenities: ['Queen Bed', 'WiFi', 'TV'],
        size: 30,
        floor: 2,
        images: ['/images/rooms/standard-double.jpg']
      }
    ]);

    console.log('Database initialized with sample data');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
    
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      console.log("Initializing database with sample data...");
      await initializeData();
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
