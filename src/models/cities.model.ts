import mongoose from "mongoose";

const CitiesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Cities name field is required'
    },
    time: {
        type: Number,
        required: 'Cities time field is required'
    }
}, {
    collection: 'Cities',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Cities = mongoose.model<mongoose.Document>('Cities', CitiesSchema);