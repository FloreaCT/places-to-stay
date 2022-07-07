const models = require("../models");
const db = require("../config/session");
const Sequelize = require("sequelize");

const findAllAccommodations = function(req, res) {
    models.accommodation.findAll().then((results) => {
            return results
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
    const time = req.body.begin_at;
    const newTime = time.split('/').reverse().join('/').replace('/', "").replace('/', "").slice(2, 8);

    try {
        await models.acc_dates.decrement({
            availability: `${req.body.npeople}`
        }, {
            where: {
                accID: req.body.accID,
                thedate: newTime
            }
        }).then(async(result) => {
            if (result[0][1] == 0) {
                res.write('Something went wrong, please contact the administrator at admin@placestostay.co.uk')
                res.end()
            }

            await models.acc_bookings.create({
                accID: req.body.accID,
                thedate: req.body.begin_at.replace(/\D/g, ''),
                npeople: req.body.npeople,
                username: "Admin"
            }).then((result) => {
                console.log("these are the new results", result);
                res.write(`Booking successful! See you soon!`)
                res.end()

            })
        })
    } catch (err) {
        return res.write("This is scandalous! We never got this error: ", err);
    }
}

const availability = async function(req, res, next) {
    await models.acc_dates.findAll({
        where: {
            accID: req.params.accID
        },
        attributes: ["thedate"]
    }).then((result) => {
        res.send(result)
    })
}

const availableSpace = async function(req, res, next) {
    await models.acc_dates.findOne({
        where: {
            thedate: req.params.date,
            accID: req.params.accID
        },
        attributes: ["availability"]
    }).then((result) => {
        res.send(result)
    })
}

module.exports = {
    findAllAccommodations: findAllAccommodations,
    book: book,
    availability: availability,
    availableSpace: availableSpace
}