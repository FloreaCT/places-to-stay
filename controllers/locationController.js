const models = require("../models");
const db = require("../config/session");
const Sequelize = require("sequelize");

const findAllAccommodations = function(req, res) {
    models.accommodation.findAll().then((results) => {
            var isAuth = req.isAuthenticated();
            res.render("index", { isAuth: isAuth, results: results });
        })
        .catch((err) => console.log(err));
};

const findAllTypes = function(req, res) {
    models.accommodation.findAll().then((results) => {
        var isAuth = req.isAuthenticated();

    }).then((types) => {
        res.json(types);
    });

}

const book = async function(req, res, next) {

    await models.acc_bookings.create({
        accID: req.body.accID,
        thedate: req.body.begin_at.replace(/\D/g, ''),
        npeople: req.body.npeople,
        username: "Admin"
    })

    await models.acc_dates.decrement({
        availability: `${req.body.npeople}`
    }, {
        where: {
            accID: req.body.accID
        }

    })
    next()
}


module.exports = {
    findAllAccommodations: findAllAccommodations,
    book: book
}