import mongoose from "mongoose";

const VehiclePricesDiscountSchema = new mongoose.Schema({
    vehiclePrices: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehiclePrices'
    },
    discount: {
        type: Number,
        required: 'Discount percentage field is required'
    },
    minPriceToApply: {
        type: Number,
        required: 'Discount min price to apply field is required'
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