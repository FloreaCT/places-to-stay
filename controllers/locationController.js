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
    const time = req.body[1].begin_at;
    console.log(req.body[1]);
    const newTime = time.split('/').reverse().join('/').replace('/', "").replace('/', "").slice(2, 8);

    try {
        await models.acc_dates.decrement({
            availability: `${req.body[1].npeople}`
        }, {
            where: {
                accID: req.body[1].accID,
                thedate: newTime
            }
        }).then(async(result) => {
            console.log(result[0][1]);
            if (result[0][1] == 0) {
                res.write('Something went wrong, please contact the administrator at admin@placestostay.co.uk')
                res.end()
            } else {

                await models.acc_bookings.create({
                    accID: req.body[1].accID,
                    thedate: req.body[1].begin_at.replace(/\D/g, ''),
                    npeople: req.body[1].npeople,
                    username: req.body[1].username
                }).then((result) => {

                    res.write(`Booking successful! See you soon!`)
                    res.end()

                })
            }

        })
    } catch (err) {
        return res.write("This is scandalous! We never got this error: ", err);
    }
}

const availability = async function(req, res, next) {
    await models.acc_dates.findAll({
        where: {
            accID: req.params.accID
        }
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