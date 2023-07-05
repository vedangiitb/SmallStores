if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const expressError = require('./utils/expressError');
const session = require('express-session');
const Joi = require('joi');
const Review = require('./models/review')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
mongoose.connect('mongodb://localhost:27017/small-stores',{
})
const Store1 = require('./models/store.js');

const userRoutes = require('./routes/users');
const stores = require('./routes/stores');
const reviews = require('./routes/reviews');

const db = mongoose.connection;
db.on('error',console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});



app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname,'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecreat!',
    resave: 'false',
    saveUninitialized: true,
    cookie:{
        httpOnly:true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser()) // Storing user in the session
passport.deserializeUser(User.deserializeUser()) // Un-Storing the user in the session

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser',async(req,res)=>{
    const user = new User({email: 'vedangbaleiitb@gmail.com', username:'Vedang'})
    const newUser = await User.register(user,'chicken');
    res.send(newUser);
})

app.use('/',userRoutes);
app.use('/stores',stores)
app.use('/stores/:id/reviews',reviews)

app.get('/',(req,res) =>{
    res.render('home')
})


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