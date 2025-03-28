
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
//app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/hotel', require('./routes/hotelRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

module.exports = app;
const PORT = process.env.PORT || 5001;

// 仅在直接运行时启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
