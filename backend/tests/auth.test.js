const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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
        id_number: 'AB123456'
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