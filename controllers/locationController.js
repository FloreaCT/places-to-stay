const models = require("../models");
// const db = require("../config/session");
const { sequelize } = require("../models");

const findAllAccommodations = function (req, res) {
  models.accommodation
    .findAll()
    .then((results) => {
      return results;
    })
    .catch((err) => console.log(err));
};

const findAllTypes = function (req, res) {
  models.accommodation
    .findAll()
    .then((results) => {
      var isAuth = req.isAuthenticated();
    })
    .then((types) => {
      res.json(types);
    });
};

const book = async function (req, res, next) {
  const time = req.body[1].begin_at;

  const newTime = time
    .split("/")
    .reverse()
    .join("/")
    .replace("/", "")
    .replace("/", "")
    .slice(2, 8);

  try {
    // Start a sequelize transaction
    const result = await sequelize.transaction(async (t) => {
      // 1st transaction decreases the number of persons for a given location
      await models.acc_dates
        .decrement(
          {
            availability: `${req.body[1].npeople}`,
          },
          {
            where: {
              accID: req.body[1].accID,
              thedate: newTime,
            },
          },
          { transaction: t }
        )
        .then(async (result) => {
          // If previous transactions fails, roll back and dont proceed to last query
          if (result[0][1] == 0) {
            res.write(
              "Something went wrong, please contact the administrator at admin@places-tostay.co.uk"
            );
            res.end();
          } else {
            // 2nd transcation creates the booking
            await models.acc_bookings
              .create(
                {
                  accID: req.body[1].accID,
                  thedate: req.body[1].begin_at.replace(/\D/g, ""),
                  npeople: req.body[1].npeople,
                  username: req.body[1].username,
                },
                { transaction: t }
              )
              .then((result) => {
                res.write(`Booking successful! See you soon!`);
                res.end();
              });
          }
        });
    });
  } catch (err) {
    return res.write("This is scandalous! We never got this error: ", err);
  }
};

const availability = async function (req, res, next) {
  await models.acc_dates
    .findAll({
      where: {
        accID: req.params.accID,
      },
    })
    .then((result) => {
      res.send(result);
    });
};

const availableSpace = async function (req, res, next) {
  await models.acc_dates
    .findOne({
      where: {
        thedate: req.params.date,
        accID: req.params.accID,
      },
      attributes: ["availability"],
    })
    .then((result) => {
      res.send(result);
    });
};

const accDetails = function (req, res) {
  models.accommodation
    .findOne({
      where: {
        id: req.params.accID,
      },
    })
    .then((results) => {
      res.send(results);
    });
};

module.exports = {
  findAllAccommodations: findAllAccommodations,
  book: book,
  availability: availability,
  availableSpace: availableSpace,
  accDetails: accDetails,
};
