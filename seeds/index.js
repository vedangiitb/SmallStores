const mongoose = require('mongoose');
const cities = require('./cities')
const Store1 = require('../models/store.js');
const {places , descriptors } = require('./seedHelpers');
const axios = require('axios')
mongoose.connect('mongodb://localhost:27017/small-stores',{
});


const db = mongoose.connection;
db.on('error',console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});
  
const sample = (array) => array[Math.floor(Math.random()*array.length)]

const seedDB = async() =>{
    await Store1.deleteMany({}) //delete everything
    for (let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const store = new Store1({
            location:`${cities[random1000].city} , ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: ' https://picsum.photos/500/400',
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus sapiente amet velit, adipisci ab sed. Provident sint ullam maxime vitae cumque voluptates, ipsam voluptatum ducimus harum quo, neque at dolorum.'
        })
        await store.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})
