const express = require("express");
const locationController = require("../controllers/locationController");
const paymentController = require("../controllers/paymentController");
const imageController = require("../controllers/imageController");
const db = require("../config/session");
const passport = require("passport");
const models = require("../models");
const Sequelize = require("sequelize");
const { sequelize } = require("../models");
const Op = Sequelize.Op;

// Initialize all web routes
const router = express.Router();

module.exports = {
  initAllAccRoute(app) {
    router.get("/accommodation/:location/:typeOfAccommodation", (req, res) => {
      // Look up for all the locations, if the user did not choose the location or the type
      if (req.params.location === "all") {
        models.accommodation.findAll().then((results) => {
          if (results.length === 0) {
            res.status(404).json({});
          } else {
            res.json(results);
          }
        });
        // Look up for all the accommodations in a particular location, if the user did not choose the type
      } else if (req.params.typeOfAccommodation === "Any") {
        models.accommodation
          .findAll({
            where: {
              [Op.or]: [
                Sequelize.where(
                  Sequelize.fn("lower", Sequelize.col("county")),
                  {
                    [Op.like]: "%" + req.params.location + "%",
                  }
                ),
                Sequelize.where(Sequelize.fn("lower", Sequelize.col("city")), {
                  [Op.like]: "%" + req.params.location + "%",
                }),
              ],
            },
          })
          .then((results) => {
            if (results.length === 0) {
              res.status(404).json({});
            } else {
              res.json(results);
            }
          });
        //Look up for all the accommodation in a particular location of a particular type
      } else {
        models.accommodation
          .findAll({
            where: {
              [Op.or]: [
                Sequelize.where(
                  Sequelize.fn("lower", Sequelize.col("county")),
                  {
                    [Op.like]: "%" + req.params.location + "%",
                  }
                ),
                Sequelize.where(Sequelize.fn("lower", Sequelize.col("city")), {
                  [Op.like]: "%" + req.params.location + "%",
                }),
              ],
              type: req.params.typeOfAccommodation,
            },
          })
          .then((results) => {
            if (results.length === 0) {
              res.status(404).json({});
            } else {
              res.json(results);
            }
          });
      }
    });

    router.get("/accDetails/:accID", locationController.accDetails);
    router.get("/images/:id", imageController.retrieveImages);
    router.post("/availability/:accID", locationController.availability);
    router.post(
      "/availability/:accID/:date",
      locationController.availableSpace
    );
    router.post("/checkCreditCard", paymentController.checkCreditCard);
    router.post("/book", locationController.book);

    return app.use("/", router);
  },
};
