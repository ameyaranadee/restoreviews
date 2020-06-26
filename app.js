var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    Restaurant  = require("./models/restaurant"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    session = require("express-session"),
    seedDB      = require("./seeds"),
    methodOverride = require("method-override");
    
//requiring routes
var commentRoutes    = require("./routes/comments"),
    reviewRoutes     = require("./routes/reviews"),
    restaurantRoutes = require("./routes/restaurants"),
    indexRoutes      = require("./routes/index")
    
// mongoose.connect("mongodb://localhost/resto_app", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

mongoose.connect('mongodb+srv://ameya:abelcristi07!@cluster0-ggsfu.mongodb.net/resto_app?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
	useCreateIndex: true
}).then(() => {
	console.log('Connected to DB!');
}).catch(err => {
	console.log('ERROR:', err.message);
});


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));

// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.locals.moment = require('moment');
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});


app.use("/", indexRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/restaurants/:id/comments", commentRoutes);
app.use("/restaurants/:id/reviews", reviewRoutes);

app.listen(process.env.PORT, process.env.IP, function() { 
    console.log("Resto Reviews has started!!!"); 
});
