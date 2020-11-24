import mongoose from "mongoose";

const PoiSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Poi name field is required'
    },
    lat: {
        type: String,
        required: 'Poi lan field is required'
    },
    lon: {
        type: String,
        required: 'Poi lon field is required'
    },    
    target: [{
        name: String,
        translation: Object,
        price: Number
    }]
}, {
    collection: 'Poi',
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

export const Poi = mongoose.model<mongoose.Document>('Poi', PoiSchema);