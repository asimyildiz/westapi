import mongoose from "mongoose";

const ExtrasSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Extras name field is required'
    },
    translation: {
        type: [mongoose.Schema.Types.Mixed]
    },
    price: {
        type: Number,
        required: 'Extras price field is required'
    },
    isMultiple: {
        type: Boolean,
        required: 'Extras isMultiple field is required'
    }
}, {
    collection: 'Extras',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Extras = mongoose.model<mongoose.Document>('Extras', ExtrasSchema);