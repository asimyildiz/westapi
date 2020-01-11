import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'City name field is required',
        unique: true
    },
    counties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'County'
    }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const City = mongoose.model<mongoose.Document>('City', CitySchema);