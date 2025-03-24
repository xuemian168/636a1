const express = require('express');
const { getAllOrders, getOrderById, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// 管理员路由
router.get('/', protect, isAdmin, getAllOrders);
router.get('/:id', protect, isAdmin, getOrderById);
router.patch('/:id/status', protect, isAdmin, updateOrderStatus);
router.delete('/:id', protect, isAdmin, deleteOrder);

module.exports = router;