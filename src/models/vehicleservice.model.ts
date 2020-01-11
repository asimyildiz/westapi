import mongoose from "mongoose";

const VehicleServiceSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }
}, {
    timestamps: true
});

export const VehicleService = mongoose.model<mongoose.Document>('VehicleService', VehicleServiceSchema);