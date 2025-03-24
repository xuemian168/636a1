const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../models/User');

let mongoServer;

before(async () => {
  mongoose.set('strictQuery', false);
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = await mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Clear users collection before tests
  await User.deleteMany({});
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Authentication Test', () => {
  it('Register Test', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        id_type: 'passport',
        id_number: 'AB123456',
        roll: 'guest'
      });
    
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('token');
  });

  it('Login Test', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
  });
});