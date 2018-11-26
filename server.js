var express = require('express');
var morgan = require('morgan')
var mongoose =  require('mongoose');
var bodyParser =  require('body-parser')
var ejs = require('ejs');
var ejsMate = require('ejs-mate');
var session = require('express-session');
var cookieParser  = require('cookie-parser');
var flash =  require('express-flash');
var mongoStore = require('connect-mongo')(session);
var passport = require('passport');


var secret = require('./config/secret');
var User =  require('./models/user.model');
var Category =  require('./models/category.model');

var cartLength = require('./middlewares/middlewares');

var app =  express();



mongoose.connect(secret._dbUrl, {useNewUrlParser: true});
mongoose.connection.on('connected', ()=>{
    console.log("Mongoose connected to "+ secret._dbUrl);
})
mongoose.connection.on('disconnected', ()=>{
    console.log("Mongoose disconnected");
})


// Middleware 
app.use(express.static(__dirname + '/public'))
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secret.secretKey,
    store: new mongoStore({ url: secret._dbUrl, autoReconnect: true })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});

app.use(cartLength);
app.use(function(req, res, next){
    Category.find({}, function(err, categories){
        if (err) return next(err);
        res.locals.categories = categories;
        next();
    });
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

var mainRoutes = require('./routes/main.routes');
var userRoutes  = require('./routes/user.routes');
var adminRoutes = require('./routes/admin.routes');
var apiRoutes = require('./api/api.routes');
 
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);

app.use((err, req, res, next)=>{
    console.log(err);
    res.json(err);
    
})

// app.get('/man', (req, res)=> {
//     // var name = "promise"
//     // res.json("My name is " + name);
//     res.render('main/about');
// });
// app.get('/', (req, res)=>{
//     res.render('main/home');
// });

app.listen(secret.port, err=>{
    if (err) throw err;
    console.log("Server is Running on port " + secret.port);
    
});