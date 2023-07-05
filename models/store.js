const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeSchema = new Schema({
    title: String,
    image:[
        {
            url:String,
            filename: String
        }
    ],
    geometry:{
        type:{
            type: String,
            enum:['Point'],
            required:true 
        },
        coordinates:{
            type: [Number],
            required: true 
        }
    },
    owner: String,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

module.exports = mongoose.model('Store',storeSchema);