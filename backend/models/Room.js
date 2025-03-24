const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomNumber: { type: String, required: true, unique: true },
  maxPeople: { type: Number, required: true, default: 2 },
  price: { type: Number, required: true, default: 0 },
  description: { type: String, required: true },
  roomType: { type: String, required: true, enum: ['Single', 'Double', 'Suite', 'Deluxe'] },
  amenities: [{ type: String }],
  size: { type: Number, required: true }, // square meters
  floor: { type: Number, required: true },
  status: { type: String, default: 'Available', enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'] },
  images: [{ type: String }], // URLs to room images
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
})

exports.Room = mongoose.model('Room', roomSchema);