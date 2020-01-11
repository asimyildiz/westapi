import mongoose from "mongoose";

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
    timestamps: true
});

export const VehiclePrices = mongoose.model<mongoose.Document>('VehiclePrices', VehiclePricesSchema);