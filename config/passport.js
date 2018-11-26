var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('../models/user.model')

// serialize ansd deserialize
passport.serializeUser( function(user, done){
    done(null, user._id);
})

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

// middleware that process the login
passport.use('local-login', new localStrategy({
    usernameField: 'email',
    password: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    User.findOne({ email: email}, function (err, user) {
         if (err) return done(err);

         if (!user) {
             return done(null, false, req.flash('loginMessage', 'No user has been found'));
         }
         
         if (!user.validPassword(password)) {
            return done(null, false, req.flash('loginMessage', 'Oops! wrong password pal'));
         }
         return done(null, user);
    })
}))

// custom function to validate
exports.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}
