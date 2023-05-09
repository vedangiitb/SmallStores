const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {storeSchema, reviewSchema} = require('./schemas');
const expressError = require('./utils/expressError');
const catchAsync = require('./utils/catchAsync');
const Joi = require('joi');
const Review = require('./models/review')
mongoose.connect('mongodb://localhost:27017/small-stores',{
})
const Store1 = require('./models/store.js');

const db = mongoose.connection;
db.on('error',console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});



app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));

const validateStore = (req,res,next) =>{

    const {error} = storeSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el =>el.message).join(',') 
        throw new expressError(msg,400)
    }else{
        next();
    }

    console.log(result);

}

const validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el =>el.message).join(',') 
        throw new expressError(msg,400)
    }else{
        next();
    }
}

app.get('/',(req,res) =>{
    res.render('home')
})

app.get('/stores',async(req,res) =>{
    const stores = await Store1.find({});
    res.render('stores/index',{stores})
}) 

app.get('/stores/new',(req,res)=>{
    res.render('stores/new');
})

//We place new before id bcoz it might treat new as id(i.e keep at last )

app.get('/stores/:id',catchAsync(async(req,res) =>{
    const store = await Store1.findById(req.params.id).populate('reviews');
    res.render('stores/show',{store});
}));

app.post('/stores', validateStore, catchAsync(async(req,res) =>{
    //if (!req.body.store) throw new expressError('Invalid store data',400)
    const store = new Store1(req.body.store);
    await store.save();
    res.redirect(`/stores/${store._id}`)

}))

app.get('/stores/:id/edit', validateStore, catchAsync( async(req,res) =>{
    const store = await Store1.findById(req.params.id)
    res.render('stores/edit',{store});
}))

app.put('/stores/:id', catchAsync(async(req,res)=>{
    const {id} = req.params;
    const store = await Store1.findByIdAndUpdate(id,{...req.body.store});
    res.redirect(`/stores/${store._id}`)
}))

app.delete('/stores/:id',catchAsync(async (req,res) =>{
    const {id} = req.params;
    await Store1.findByIdAndDelete(id)
    res.redirect('/stores')
}))

app.post('/stores/:id/reviews', validateReview, catchAsync(async (req,res)=>{{
    const store = await Store1.findById(req.params.id);
    const review = new Review(req.body.review)
    store.reviews.push(review)
    await review.save()
    await store.save()
    res.redirect(`/stores/${store._id}`);
}}))

app.all('*',(req,res,next) =>{
    next(new expressError('Page not found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode =500, message = 'something went wrong'} = err
    if (!err.message) err.message = 'Oh No, Something went wrong!'
    res.status(statusCode).render('error',{err});
})

app.listen(3000,()=>{
    console.log('Listening on port 3000')
})