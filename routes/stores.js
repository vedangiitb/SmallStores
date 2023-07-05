const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const expressError = require('../utils/expressError');
const Store1 = require('../models/store.js');
const {storeSchema} = require('../schemas.js');
const {isLoggedIn} = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken =  process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: mapBoxToken })
const validateStore = (req,res,next) =>{
    const {error} = storeSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el =>el.message).join(',') 
        throw new expressError(msg,400)
    }else{
        next();
    }

    //console.log(result);

}

const isAuthor = async(req,res,next) =>{
    const {id} = req.params;
    const store= await Store1.findById(id);
    if (!store.author.equals(req.user._id)){
        req.flash('error','You do not have required permissions')
        return res.redirect(`/stores/${id}`);
    }
    next();
}

router.get('/',catchAsync(async(req,res) =>{
    const stores = await Store1.find({});
    res.render('stores/index',{stores})
})); 

router.get('/new',isLoggedIn, (req,res)=>{
    if (!req.isAuthenticated()){
        req.flash('error','You must be signed in')
        return res.redirect('/login');
    }
    res.render('stores/new');
})

//We place new before id bcoz it might treat new as id(i.e keep at last )

router.get('/:id',catchAsync(async(req,res) =>{
    const store = await Store1.findById(req.params.id).populate({
        path:'reviews', 
        populate:{
            path:'author'
    }
}).populate('author');
    console.log(store)
    if (!store){
        req.flash('error','Cannot find that campground')
        return res.redirect('/stores')
    }
    res.render('stores/show',{store});
}));

router.post('/',isLoggedIn ,upload.array('image'),validateStore, catchAsync(async(req,res,next) =>{
    //if (!req.body.store) throw new expressError('Invalid store data',400)
    const geoData = await geoCoder.forwardGeocode({
        query:req.body.store.location,
        limit:1
    }).send();
    const store = new Store1(req.body.store);
    store.geometry=  geoData.body.features[0].geometry;
    store.image = req.files.map(f => ({url:f.path, filename: f.filename}))
    store.author = req.user._id;
    await store.save();
    console.log(store)
    req.flash('success','Successfully made a new store!')
    res.redirect(`/stores/${store._id}`)
}))

router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateStore,catchAsync(async(req,res)=>{
    const {id} = req.params;
    const store = await Store1.findByIdAndUpdate(id,{...req.body.store});
    const imgs = req.files.map(f => ({url:f.path, filename: f.filename}))
    store.image.push(...imgs);
    await store.save()
    req.flash('success','Successfully updated store!')
    res.redirect(`/stores/${store._id}`)
}))

router.get('/:id/edit', isLoggedIn,isAuthor,validateStore, catchAsync( async(req,res) =>{
    const {id} = req.params;
    const store = await Store1.findById(req.params.id)
    if (!store){
        req.flash('error','Cannot find that store!');
        res.redirect('/stores');
    }
    res.render('stores/edit',{store});
}))



router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async (req,res) =>{
    const {id} = req.params;
    await Store1.findByIdAndDelete(id)
    res.redirect('/stores')
}))

module.exports = router;
