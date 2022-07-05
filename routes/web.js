const express = require('express');
const initPassportLocal = require('../controllers/passport/passportLocal')
const locationController = require('../controllers/locationController')
const db = require('../config/session')
const passport = require('passport')
const models = require('../models')

// Initialize passport
initPassportLocal()

// Initialize all web routes
const router = express.Router();

module.exports = {
    initAllWebRoute(app) {
        router.get("/", locationController.findAllAccommodations)


        router.get('/accommodation', (req, res) => {
            models.accommodation.findAll().then((results) => {
                res.json(results);
            })
        })

        return app.use("/", router)
    }
}