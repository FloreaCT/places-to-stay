const express = require('express');
const locationController = require('../controllers/locationController')
const initPassportLocal = require('../controllers/passport/passportLocal')
const imageController = require('../controllers/imageController')
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
            res.render('index.ejs')
        })

        router.get('/accommodation', (req, res) => {
            const isAuth = req.isAuthenticated() // TODO: Remove me later 
            models.accommodation.findAll().then((results) => {
                res.json(results);
            })
        })

        router.get('/unauthorized', authController.checkLoggedIn, function(req, res) {
            return res.sendStatus(200)
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
                    // const isAuth = req.isAuthenticated() // TODO: Remove me later 
                    req.session.user = req.user;
                    // const theuser = req.user // TODO: Remove me later 
                    return res.json(user)
                }
                req.logIn(user, function(err) {
                    if (err) {

                        return next(err);
                    }
                    // const isAuth = req.isAuthenticated() // TODO: Remove me later 
                    req.session.user = req.user;
                    // const theuser = req.user // TODO: Remove me later 
                    res.json(user)
                });
            })(req, res, next);
        });

        router.post('/register', authController.register)
        router.post('/logout', authController.postLogOut)
        router.post("/uploadImage", imageController.upload.single('file'), imageController.image)

        router.get("*", function(req, res) {
            const results = locationController.findAllAccommodations;
            res.status(404).render('404.ejs', { results: results });
        });

        return app.use("/", router)
    }
}