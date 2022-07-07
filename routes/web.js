const express = require('express');
const locationController = require('../controllers/locationController')
const initPassportLocal = require('../controllers/passport/passportLocal')
const authController = require('../controllers/authController')
const db = require('../config/session')
const passport = require('passport')
const models = require('../models')


// Initialize passport
initPassportLocal()

// Initialize all web routes
const router = express.Router();

module.exports = {
    initAllWebRoute(app) {
        router.get("/", (req, res, next) => {
            const errors = req.flash().error || [];
            const results = locationController.findAllAccommodations;
            const isAuth = req.isAuthenticated()
            res.render('index.ejs', { results: results, isAuth: isAuth })
        })

        router.get('/accommodation', (req, res) => {
            models.accommodation.findAll().then((results) => {
                res.json(results);
            })
        })

        router.get("/error", (req, res) => {
            res.render("error.ejs")
        })

        router.post("/login", function(req, res, next) {
            passport.authenticate('local', {
                failureFlash: true,
                failureRedirect: "/",
                failureMessage: "Attempt to login has failed!",
                successMessage: "You have succesfully logged in!",
                successRedirect: "/"
            }, function(err, user, info) {

                if (err) {

                    return next(err);
                }
                if (!user) {
                    return res.render('404.ejs');
                }
                req.logIn(user, function(err) {
                    if (err) {

                        return next(err);
                    }
                    const isAuth = req.isAuthenticated()
                    req.session.user = req.user;
                    const theuser = req.user
                    res.render('index.ejs', { isAuth: isAuth, theuser: theuser })
                });
            })(req, res, next);
        });

        router.post('/logout', authController.postLogOut)

        app.use(function(req, res, next) {
            res.locals.success_messages = req.flash('success_messages');
            res.locals.error_messages = req.flash('error_messages');
            next();
        });

        return app.use("/", router)
    }
}