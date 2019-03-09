var User = require('./models/Users');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jsonwebtoken');
var config = require('./config');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var FacebookTokenStrategy = require('passport-facebook-token');
var GoogleTokenStrategy = require('passport-google-token').Strategy;

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey,
        { expiresIn:  100000});
}

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        User.findOne({_id: jwt_payload._id}, (err, user) =>{
            if(err)
                return done(err, false);
            else if(user)
                return done(null, user);
            else
                return done(null, false);
        })
    }));

exports.verifyUser = passport.authenticate('jwt', { session: false });
exports.verifyAdmin = [
    passport.authenticate('jwt', { session: false }), (req, res, next) => {
        if (req.user && req.user.admin)
            next();
        else {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            next(err);
        }
    }
];

passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}
));

passport.use(new GoogleTokenStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ googleId: profile.id }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
  }
));