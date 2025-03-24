const { Room } = require('../models/Room');
const Order = require('../models/Order');

// 创建新房间 - 仅管理员
const createRoom = async (req, res) => {
    try {
        // 验证用户权限
        if (req.user.roll !== 'admin') {
            return res.status(403).json({ message: '只有管理员可以创建房间' });
        }
        const room = new Room(req.body);
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 获取所有房间 - 所有用户可访问
const getAllRooms = async (req, res) => {
    try {
        const filters = {};
        
        // 处理查询参数
        if (req.query.roomType) filters.roomType = req.query.roomType;
        if (req.query.status) filters.status = req.query.status;
        if (req.query.maxPrice) filters.price = { $lte: parseInt(req.query.maxPrice) };
        if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

        // 如果是普通用户，只显示可用的房间
        if (!req.user || req.user.roll !== 'admin') {
            filters.status = 'Available';
            filters.isActive = true;
        }

        const rooms = await Room.find(filters);
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 获取单个房间 - 所有用户可访问
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: '房间不存在' });
        }

        // 如果是普通用户，检查房间是否可用
        if (!req.user || req.user.roll !== 'admin') {
            if (room.status !== 'Available' || !room.isActive) {
                return res.status(403).json({ message: '该房间当前不可预订' });
            }
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 更新房间信息 - 仅管理员
const updateRoom = async (req, res) => {
    try {
        if (req.user.roll !== 'admin') {
            return res.status(403).json({ message: '只有管理员可以更新房间信息' });
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: '房间不存在' });
        }

        delete req.body._id;
        delete req.body.createdAt;
        delete req.body.updatedAt;

        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updatedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 删除房间 - 仅管理员
const deleteRoom = async (req, res) => {
    try {
        if (req.user.roll !== 'admin') {
            return res.status(403).json({ message: '只有管理员可以删除房间' });
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: '房间不存在' });
        }
        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: '房间已成功删除' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 更新房间状态 - 仅管理员
const updateRoomStatus = async (req, res) => {
    try {
        if (req.user.roll !== 'admin') {
            return res.status(403).json({ message: '只有管理员可以更新房间状态' });
        }

        const { status } = req.body;
        if (!['Available', 'Occupied', 'Maintenance', 'Reserved'].includes(status)) {
            return res.status(400).json({ message: '无效的房间状态' });
        }

        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!room) {
            return res.status(404).json({ message: '房间不存在' });
        }

        res.json(room);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 预订房间
const bookRoom = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut } = req.body;
        const room = await Room.findById(roomId);

        // 验证房间是否存在和可用
        if (!room) {
            return res.status(404).json({ message: '房间不存在' });
        }
        if (room.status !== 'Available') {
            return res.status(400).json({ message: '该房间当前不可预订' });
        }

        // 计算总价（天数 * 每晚价格）
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = numberOfNights * room.price;

        // 创建订单
        const order = new Order({
            user: req.user._id,
            room: roomId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            numberOfGuests: room.maxPeople,
            totalPrice,
            contactPhone: req.user.phone || '',
            status: 'Pending',
            paymentStatus: 'Unpaid'
        });

        await order.save();

        // // 更新房间状态为已预订
        // room.status = 'Reserved';
        // await room.save();

        res.status(201).json({
            success: true,
            message: '预订成功',
            data: {
                orderId: order._id,
                roomName: room.name,
                checkIn,
                checkOut,
                totalPrice,
                status: order.status
            }
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 更新导出对象，添加新方法
module.exports = {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
    bookRoom  // 添加新方法到导出
};