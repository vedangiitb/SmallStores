const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeSchema = new Schema({
    title: String,
    image:String,
    owner: String,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

module.exports = mongoose.model('Store',storeSchema);