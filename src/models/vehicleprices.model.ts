import mongoose from 'mongoose';

const VehiclePricesSchema = new mongoose.Schema({
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
        default: 'try'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    vehiclePricesDiscounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehiclePricesDiscount'
    }]
}, {
    collection: 'VehiclePrices',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const VehiclePrices = mongoose.model<mongoose.Document>('VehiclePrices', VehiclePricesSchema);