if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


// console.log(process.env.CLOUDINARY_CLOUD_NAME);
const express = require('express')
const path = require('node:path')
const morgan = require('morgan')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize'); //ignore query with dot $ etc from the req.query
const campgroundRoutes = require('./routes/campgroundRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const userRoutes = require('./routes/userRoutes')
const LocalStrategy = require('passport-local')
const passport = require('passport')
const User = require('./models/user')
const helmet = require('helmet')



mongoose.set("strictQuery", true);
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    "mongodb://127.0.0.1:27017/yelp-camp"
  );
}

const db = mongoose.connection
db.on('error',console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})


const app = express()

app.engine('ejs',ejsMate)
app.set('view engine' , 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(morgan('dev'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize( { replaceWith: '_'}))//replace query string with dot or $ etc to _. or _$

const sessionConfig = {
  name:'risinggirl', //overwrite cookie's default name which is session.id for security purpose
  secret: 'thisshouldbeabettersecret',
  resave:false,
  saveUninitialized:true,
  cookie: {
    httpOnly:true,
    // secure:true,
    expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge:1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))
app.use(flash())
// app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())  //store user
passport.deserializeUser(User.deserializeUser())  //unstore user

app.use((req,res,next) => {
  console.log(req.query);
  //console.log(req.session);
  if(!['/login', '/'].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl
  }
  res.locals.currentUser = req.user  // access currentUser from all templates
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})


app.use('/', userRoutes)
app.use('/campground', campgroundRoutes)
app.use('/campground/:id/reviews', reviewRoutes)

app.get('/', (req,res) => {
    res.render('home')
})





app.all('*', (req,res,next) => {  //it will handle error if query is other than specified above 
next(new ExpressError('page not found', 404))
})

app.use((err,req,res,next) => {
 const {statusCode = 500, message = 'something went wrong'} = err
 if(!err.message) {err.message = 'Oh No, Something Went Wrong!'}
 res.status(statusCode).render('./partials/error',{err})
 
})


app.listen(5000, () => {
    console.log('APP RUNNING ON PORT 5000')
})