var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var authenticate = require('../authenticate');
var User = require('../models/Users');
const passport = require('passport');

router.use(bodyParser.json());


router.get('/', (req, res, next) => {
  User.find({})
    .populate('books')
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.get('/:userId', (req, res, nexy) => {
  User.findById(req.params.userId)
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
})

router.route('/favorites')
  .post(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then(user => {
        user.favorites.push(req.body.book);
        user.save()
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-type', 'application/json');
            res.json(user);
          }, err => next(err))
      })
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then(user => {
        user.favorites =  user.favorites.filter(fav => !fav.equals(req.book));
        user.save()
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-type', 'application/json');
            res.json(user);
          }, err => next(err))
      })
      .catch(err => next(err));
    })

router.post('/signup', (req, res, next) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: err });
    }
    else {
      if (req.body.name)
        user.name = req.body.name;
      if (req.body.phoneNumber)
        user.phoneNumber = req.body.phoneNumber;

      user.location = "Астана";
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err: err });
          return;
        }
        passport.authenticate('local')(req, res, () => {
          var token = authenticate.getToken({ _id: req.user._id });
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, token: token, status: 'Registration Successful!', user: req.user });
        });
      });
    }
  });
});


router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, status: 'Login Unsuccessful!!!', err: info });
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: false, status: 'Login Unsuccessful!!', err: 'Could not log in user!' });
      }

      var token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, status: 'Login Successful!!!!!', token: token, user: req.user });
      console.log(req.user.username);
    });
  })(req, res, next);
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!', user: req.user });
  }
});

router.get('/google/token', passport.authenticate('google-token'), function (req, res) {
  if (req.user) {
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
  }
});

module.exports = router;
