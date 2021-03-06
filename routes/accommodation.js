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

                models.accommodation.findAll({
                    where: {
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn("lower", Sequelize.col("county")), {
                                [Op.like]: "%" + req.params.location + "%",
                            }),
                            Sequelize.where(Sequelize.fn("lower", Sequelize.col("city")), {
                                [Op.like]: "%" + req.params.location + "%",
                            })
                        ],
                    }
                }).then((results) => {
                    res.json(results);
                })
            } else {
                models.accommodation.findAll({
                    where: {
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn("lower", Sequelize.col("county")), {
                                [Op.like]: "%" + req.params.location + "%",
                            }),
                            Sequelize.where(Sequelize.fn("lower", Sequelize.col("city")), {
                                [Op.like]: "%" + req.params.location + "%",
                            })
                        ],
                        type: req.params.typeOfAccommodation

                    }
                }).then((results) => {
                    res.json(results);
                })
            }

        })

        router.get("/accDetails/:accomID", locationController.accDetails)
        router.get("/images/:id", imageController.retrieveImages)
        router.post("/availability/:accomID", locationController.availability)
        router.post("/availability/:accomID/:date", locationController.availableSpace)
        router.post("/checkCreditCard", paymentController.checkCreditCard)
        router.post("/book", locationController.book)
        router.post("/uploadImage", imageController.upload.single('file'), imageController.image)

        return app.use("/", router)
    }
}