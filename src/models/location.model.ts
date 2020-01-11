import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Location name field is required'
    },
    detail: {
        type: String,
        required: 'Location detail field is required'
    },
    county: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'County'
    },
    reservations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    }]
}, {
    timestamps: true
});

export const Location = mongoose.model<mongoose.Document>('Location', LocationSchema);