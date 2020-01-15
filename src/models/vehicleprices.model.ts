import mongoose from 'mongoose';

const VehiclePricesSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    minPrice: {
        type: Number,
        required: 'Vehicle min price field is required'
    },
    price: {
        type: Number,
        required: 'Vehicle price field is required'
    },
    minDistance: {
        type: Number,
        required: 'Price distance field is required'
    },
    currency: {
        type: String,
        default: 'TRY',
        enum: ['TRY', 'USD', 'EUR']
    },
    isActive: {
        type: Boolean,
        default: false
    },
    vehiclePricesDiscounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehiclePricesDiscount'
    }],
    reservations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

// this is to ensure that there is only one active price for a currency
// if we try to set multiple active price, mongoose will fire an exception
VehiclePricesSchema.index({
    currency: 1    
}, {
    unique: true,
    partialFilterExpression: {
        isActive: { $eq: true }
    }
});

export const VehiclePrices = mongoose.model<mongoose.Document>('VehiclePrices', VehiclePricesSchema);