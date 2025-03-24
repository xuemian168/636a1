
const express = require('express');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
    bookRoom
} = require('../controllers/roomController');

const router = express.Router();

// 公开路由 - 所有用户都可以访问
router.get('/rooms', getAllRooms);
router.get('/rooms/:id', getRoomById);
router.post('/rooms/:id/book', protect, bookRoom);

// 管理员路由 - 需要管理员权限
router.post('/rooms', protect, isAdmin, createRoom);
router.put('/rooms/:id', protect, isAdmin, updateRoom);
router.delete('/rooms/:id', protect, isAdmin, deleteRoom);
router.patch('/rooms/:id/status', protect, isAdmin, updateRoomStatus);


module.exports = router;
