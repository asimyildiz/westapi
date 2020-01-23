import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: 'Device unique id field is required',
        unique: true
    },
    lastAccessDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Device = mongoose.model<mongoose.Document>('Device', DeviceSchema);