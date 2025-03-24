const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('MongoDB Connection Test', () => {
  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('Conn MongoDB', () => {
    expect(mongoose.connection.readyState).to.equal(1);
  });

  it('Conn and Search Success', async () => {
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    
    await TestModel.create({ name: 'test' });
    const doc = await TestModel.findOne({ name: 'test' });
    
    expect(doc).to.have.property('name', 'test');
  });
});