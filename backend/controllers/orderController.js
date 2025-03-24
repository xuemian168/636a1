const Order = require('../models/Order');
const Room = require('../models/Room');
const mongoose = require('mongoose');

// 获取所有订单
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email phone')
            .populate('room', 'roomNumber type price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 获取单个订单
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('room', 'roomNumber type price');
        if (!order) {
            return res.status(404).json({ message: '订单不存在' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 更新订单状态
const updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id).session(session);
        if (!order) {
            return res.status(404).json({ message: '订单不存在' });
        }

        // 添加状态历史记录
        order.statusHistory.push({
            status,
            updatedBy: req.user._id,
            note
        });

        order.status = status;
        const updatedOrder = await order.save();

        // 如果状态是入住或退房，同步更新房间状态
        if (status === 'CheckedIn' || status === 'CheckedOut') {
            const room = await Room.findById(order.room).session(session);
            if (!room) {
                throw new Error('房间不存在');
            }

            room.status = status === 'CheckedIn' ? 'Occupied' : 'Available';
            await room.save();
        }

        await session.commitTransaction();
        res.json(updatedOrder);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

// 删除订单
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: '订单不存在' });
        }

        await order.remove();
        res.json({ message: '订单已删除' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 处理入住
const checkIn = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(req.params.id).session(session);
        if (!order) {
            return res.status(404).json({ message: '订单不存在' });
        }

        if (order.status !== 'Confirmed') {
            return res.status(400).json({ message: '只有已确认的订单可以办理入住' });
        }

        // 验证入住时间
        const now = new Date();
        const checkInDate = new Date(order.checkIn);
        if (now < checkInDate) {
            return res.status(400).json({ message: '还未到入住时间' });
        }

        // 更新订单状态
        order.statusHistory.push({
            status: 'CheckedIn',
            updatedBy: req.user._id,
            note: '客人已入住'
        });
        order.status = 'CheckedIn';
        await order.save();

        // 更新房间状态
        const room = await Room.findById(order.room).session(session);
        if (!room) {
            throw new Error('房间不存在');
        }
        room.status = 'Occupied';
        await room.save();

        await session.commitTransaction();
        res.json(order);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

// 处理退房
const checkOut = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(req.params.id).session(session);
        if (!order) {
            return res.status(404).json({ message: '订单不存在' });
        }

        if (order.status !== 'CheckedIn') {
            return res.status(400).json({ message: '只有已入住的订单可以办理退房' });
        }

        // 更新订单状态
        order.statusHistory.push({
            status: 'CheckedOut',
            updatedBy: req.user._id,
            note: '客人已退房'
        });
        order.status = 'Completed';
        await order.save();

        // 更新房间状态
        const room = await Room.findById(order.room).session(session);
        if (!room) {
            throw new Error('房间不存在');
        }
        room.status = 'Available';
        await room.save();

        await session.commitTransaction();
        res.json(order);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    checkIn,
    checkOut
};