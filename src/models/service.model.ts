import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Service name field is required'
    },
    icon: {
        type: String,
        required: 'Service icon is required'
    },
    isPaid: {
        type: Boolean,
        required: 'Service paid status is required'
    },
    price: {
        type: Number,
        default: 0
    },
    byHour: {
        type: Number,
        default: 0
    },
    byKilometers: {
        type: Number,
        default: 0
    },
    maxLimit: {
        type: Number,
        default: 1
    }
}, {
    collection: 'Service',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Service = mongoose.model<mongoose.Document>('Service', ServiceSchema);