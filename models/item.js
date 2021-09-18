const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    expires: {
        type: Boolean,
        required: true
    },
    path: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;