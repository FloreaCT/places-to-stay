const models = require('../models')
const valid = require("card-validator");
const { book } = require('../controllers/locationController')

const checkCreditCard = async function(req, res, next) {



    var ccNumber = valid.number(req.body[0].cardNumber)
    var ccHolder = valid.cardholderName(req.body[0].cardHolder)
    var exp = valid.expirationDate(req.body[0].expDetails)
    var cvv = valid.cvv(req.body[0].cardCVC)

    if (!ccNumber.isValid) {
        return res.send('number')
    } else if (!ccHolder.isValid) {
        return res.send('holder')
    } else if (!exp.isValid) {
        return res.send('exp')
    } else if (!cvv.isValid) {
        return res.send('cvv')
    } else {
        book(req, res, next)
        return res.send('Well done')
    }
}


module.exports = { checkCreditCard: checkCreditCard }