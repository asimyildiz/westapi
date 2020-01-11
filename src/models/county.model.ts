import mongoose from "mongoose";

const CountySchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'County name field is required',
        unique: true
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    locations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    }],
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const County = mongoose.model<mongoose.Document>('County', CountySchema);