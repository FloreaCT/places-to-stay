const express = require('express');
const locationController = require('../controllers/locationController')
const paymentController = require('../controllers/paymentController')
const db = require('../config/session')
const passport = require('passport')
const models = require('../models')
const imageController = require('../controllers/imageController')
const Sequelize = require("sequelize");
const { sequelize } = require('../models');
const Op = Sequelize.Op;

// Initialize all web routes
const router = express.Router();

module.exports = {
    initAllAccRoute(app) {

        router.get('/accommodation/:location/:typeOfAccommodation', (req, res) => {

            if (req.params.location === 'all') {
                models.accommodation.findAll().then((results) => {
                    res.json(results)
                })

            } else if (req.params.typeOfAccommodation === "Any") {
                console.log('here');
                console.log(req.params.location);
                models.accommodation.findAll({
                    where: {
                        location: sequelize.where(sequelize.fn('lower', sequelize.col('location')), 'like', '%' + req.params.location + '%')
                    }
                }).then((results) => {

                    res.json(results);
                })
            } else {
                console.log(req.params.location);
                models.accommodation.findAll({
                    where: {
                        location: {
                            [Op.like]: '%' + req.params.location + '%'
                        },
                        type: req.params.typeOfAccommodation

                    }
                }).then((results) => {
                    res.json(results);
                })
            }

        })

        router.get("/accDetails/:accID", locationController.accDetails)
        router.post("/availability/:accID", locationController.availability)
        router.post("/availability/:accID/:date", locationController.availableSpace)
        router.post("/checkCreditCard", paymentController.checkCreditCard)
        router.post("/book", locationController.book)

        router.post("/uploadImage", imageController.upload.single('file'), imageController.image)

        return app.use("/", router)
    }
}