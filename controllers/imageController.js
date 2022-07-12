const multer = require('multer')
const path = require('path')
const db = require('../config/session')
const models = require('../models')

var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, "./public/images/uploadedImages") // './public/images/' directory name where to save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage
});


const image = async(req, res) => {

    if (!req.file) {
        res.json({ 'nofile': 'No file uploaded' })
    } else {

        var imgName = '/images/uploadedImages/' + req.file.filename

        await models.acc_images.create({
            accID: req.session.passport.user,
            imagePath: imgName
        }).then((results) => {
            res.send(results)
        })


    }
}

module.exports = { image: image, upload: upload }