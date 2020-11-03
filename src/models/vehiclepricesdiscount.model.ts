import mongoose from "mongoose";

const VehiclePricesDiscountSchema = new mongoose.Schema({
    discount: {
        type: Number,
        default: 0
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    distanceToApply: {
        type: Number,
        required: 'Min distance to apply field is required'
    },
    startDate: {
        type: Date,
        required: 'Discount start date field is required'
    },
    endDate: {
        type: Date,
        required: 'Discount end date field is required'
    },
    icon: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    collection: 'VehiclePricesDiscount',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const VehiclePricesDiscount = mongoose.model<mongoose.Document>('VehiclePricesDiscount', VehiclePricesDiscountSchema);