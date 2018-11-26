var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

/*The user schema attributes characteristics / fields */
var UserSchema =  new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: String,
    profile:{
        name: { type: String, default: ''},
        picture: { type: String, default: ''}
    },
    address: String,
    history: [{ 
            paid: { type: Number, default: 0},
            item: {type: Schema.Types.ObjectId, ref:"Product"}
        }]
});

/* Hash the password before we even save it to the database*/
UserSchema.pre('save', function(next){
    var user =  this;
    if (!user.isModified('password')) return next(); // if the password is not modified do that else generate salt
    bcrypt.genSalt(10, (err, salt)=> {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, null, (err, hash)=> {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});


/* Compare password in the database and the one the user type in */
UserSchema.methods.validPassword = function(password) {
    if (this.password != null){
      return bcrypt.compareSync(password, this.password);  
    } else {
       return false; 
    }
    
};


// Gravatar unique profile pictures
UserSchema.methods.gravatar =  function(size) {
    if (!this.size)  size = 200;
    if (!this.email) return 'https://gravtar.com/avatar/7s' + size + '&d=retro';
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravtar.com/avatar' + md5 + '7s=' + size + '&d=retro';
 };


module.exports = mongoose.model('User', UserSchema);