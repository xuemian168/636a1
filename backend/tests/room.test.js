const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Room API Test', () => {
  let authToken;
  let roomId;

  before(async () => {
    // 创建管理员用户
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      phone: '1234567890',
      id_type: 'passport',
      id_number: 'AD123456',
      roll: 'admin'  // 直接设置为管理员角色
    });

    // 登录获取 token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'admin123'
      });
    
    authToken = loginRes.body.token;
  });

  it('Create Room Test', async () => {
    const res = await request(app)
      .post('/api/hotel/rooms')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Room',
        roomNumber: 'A101',
        maxPeople: 2,
        price: 100,
        description: 'Test room description',
        roomType: 'Single',
        size: 30,
        floor: 1
      });
    expect(res.status).to.equal(201);
    roomId = res.body._id;
  });

  it('Get Room List Test', async () => {
    const res = await request(app)
      .get('/api/hotel/rooms');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('Update Room Test', async () => {
    const res = await request(app)
      .put(`/api/hotel/rooms/${roomId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        price: 120
      });
    expect(res.status).to.equal(200);
    expect(res.body.price).to.equal(120);
  });
});