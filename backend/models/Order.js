const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    room: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Room',
        required: true 
    },
    checkIn: { 
        type: Date, 
        required: true 
    },
    checkOut: { 
        type: Date, 
        required: true 
    },
    numberOfGuests: { 
        type: Number, 
        required: true 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Refunded'],
        default: 'Unpaid'
    },
    specialRequests: { 
        type: String 
    },
    guestNames: [{ 
        type: String 
    }],
    contactPhone: { 
        type: String,
        required: true
    },
    statusHistory: [{
        status: { 
            type: String,
            enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'CheckedIn', 'CheckedOut'],
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
}, {
    timestamps: true
});

orderSchema.pre('save', async function(next) {
    if (this.checkOut <= this.checkIn) {
        throw new Error('Check-out time must be after check-in time');
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);