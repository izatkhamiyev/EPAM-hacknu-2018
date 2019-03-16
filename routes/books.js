var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var authenticate = require('../authenticate');
var User = require('../models/Users');
var Book = require('../models/Books');
const passport = require('passport');

const scrape = require('./parsing');

router.use(bodyParser.json());

router.route('/')
    .get((req, res, next) => {
        Book.find({})
            .populate('comments')
            .then((books) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(books);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        if (req.body != null) {
            scrape(req.body.title)
                .then(result => {
                    if(result.des.length)
                        req.body.description = result.des[0];
                    if(result.des.length > 1)
                        req.body.description += result.des[1];
                    req.body.image = result.src;
                    req.body.owner = req.user._id;
                    req.body.tenant = req.user._id;
                    Book.create(req.body)
                        .then(book => {
                            User.findById(req.user._id)
                                .then(user => {
                                    user.books.push(book._id);
                                    user.save()
                                        .then(() => {
                                            Book.findById(book._id)
                                                .populate('comments')
                                                .then(book => {
                                                    res.statusCode = 200;
                                                    res.setHeader('Content-type', 'application/json');
                                                    res.json(book);
                                                })
                                        }, err => next(err))
                                }).catch(err => next(err));
                        })
                        .catch(err => next(err));
                })
                .catch(err => {
                    req.body.owner = req.user._id;
                    req.body.tenant = req.user._id;
                    Book.create(req.body)
                        .then(book => {
                            User.findById(req.user._id)
                                .then(user => {
                                    user.books.push(book._id);
                                    user.save()
                                        .then(() => {
                                            Book.findById(book._id)
                                                .populate('comments')
                                                .then(book => {
                                                    res.statusCode = 200;
                                                    res.setHeader('Content-type', 'application/json');
                                                    res.json(book);
                                                })
                                        }, err => next(err))
                                }).catch(err => next(err));
                        })
                        .catch(err => next(err));
                });
        } else {
            err = new Error('Book not found in request body');
            err.status = 404;
            return next(err);
        }
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /books/');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported on /books/');
    })

router.route('/:bookId')
    .get((req, res, next) => {
        Book.findById(req.params.bookId)
            .populate('comments')
            .then((owner) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(owner);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /books/' + req.params.bookId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Book.findById(req.params.bookId)
            .then(book => {
                if (book != null) {
                    if (!book.owner.equals(req.user._id)) {
                        var err = new Error('You are not authorized to update this book!');
                        err.status = 403;
                        return next(err);
                    }
                    req.body.owner = req.user._id;
                    Book.findByIdAndUpdate(req.params.bookId, {
                        $set: req.body
                    }, { new: true })
                        .then((book) => {
                            Book.findById(book._id)
                                .populate('comments')
                                .then((book) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(book);
                                })
                        }, (err) => next(err));
                }
                else {
                    err = new Error('BOOK ' + req.params.bookId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Book.findById(req.params.bookId)
            .then((book) => {
                if (book != null) {
                    if (!book.owner.equals(req.user._id)) {
                        var err = new Error('You are not authorized to delete this book!');
                        err.status = 403;
                        return next(err);
                    }
                    Book.findByIdAndRemove(req.params.bookId)
                        .then((resp) => {
                            User.findById(req.user._id)
                                .then(user => {
                                    user.books = user.books.filter(book => !book.equals(resp._id));
                                    user.save()
                                })
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(resp);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                else {
                    err = new Error('Book ' + req.params.bookId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

router.route("/:bookId/request")
.get(authenticate.verifyUser, (req, res, next)=>{
    Book.findById(req.params.bookId)
    .then((book) => {
        User.findById(book.owner)
        .then((user) => {
            console.log(user);
            user.requests.push(req.user._id);
            user.save()
            .then(user =>{
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(user);
            }, err => next(err))
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
})
module.exports = router;