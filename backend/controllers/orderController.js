const Order = require('../models/Order');
const Room = require('../models/Room');
const mongoose = require('mongoose');

// Get all orders
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

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('room', 'roomNumber type price');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id).session(session);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Add status history record
        order.statusHistory.push({
            status,
            updatedBy: req.user._id,
            note
        });

        order.status = status;
        const updatedOrder = await order.save();

        // If status is CheckedIn or CheckedOut, sync room status
        if (status === 'CheckedIn' || status === 'CheckedOut') {
            const room = await Room.findById(order.room).session(session);
            if (!room) {
                throw new Error('Room not found');
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

// Delete order
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await order.remove();
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Handle check-in
const checkIn = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(req.params.id).session(session);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'Confirmed') {
            return res.status(400).json({ message: 'Only confirmed orders can be checked in' });
        }

        // Validate check-in time
        const now = new Date();
        const checkInDate = new Date(order.checkIn);
        if (now < checkInDate) {
            return res.status(400).json({ message: 'Check-in time has not arrived yet' });
        }

        // Update order status
        order.statusHistory.push({
            status: 'CheckedIn',
            updatedBy: req.user._id,
            note: 'Guest checked in'
        });
        order.status = 'CheckedIn';
        await order.save();

        // Update room status
        const room = await Room.findById(order.room).session(session);
        if (!room) {
            throw new Error('Room not found');
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

// Handle check-out
const checkOut = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(req.params.id).session(session);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'CheckedIn') {
            return res.status(400).json({ message: 'Only checked-in orders can be checked out' });
        }

        // Update order status
        order.statusHistory.push({
            status: 'CheckedOut',
            updatedBy: req.user._id,
            note: 'Guest checked out'
        });
        order.status = 'Completed';
        await order.save();

        // Update room status
        const room = await Room.findById(order.room).session(session);
        if (!room) {
            throw new Error('Room not found');
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