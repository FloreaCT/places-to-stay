const multer = require("multer");
const path = require("path");
const models = require("../models");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    const imagePath = `./public/images/uploadedImages/${file.originalname}`; // originalname is the ID of the accommodation
    fs.mkdirSync(imagePath, { recursive: true });
    callBack(null, imagePath); // './public/images/uploadedImages/AccommodationID' directory name where to save the file
  },
  filename: (req, file, callBack) => {
    const extension = file.mimetype.split("/");
    callBack(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        path.extname(file.originalname) +
        "." +
        extension.slice(-1)
    );
  },
});

var upload = multer({
  storage: storage,
});

const image = async (req, res) => {
  if (!req.file) {
    res.json({ nofile: "No file uploaded" });
  } else {
    var imgName =
      "/images/uploadedImages/" +
      req.file.originalname +
      "/" +
      req.file.filename;
    await models.acc_images
      .create({
        accID: req.file.originalname,
        imagePath: imgName,
        approved: 1,
      })
      .then((results) => {
        models.acc_images
          .findOne({
            where: {
              accID: req.file.originalname,
              imagePath: "/images/nophoto.jpg",
            },
          })
          .then((results) => {
            if (results) {
              models.acc_images.destroy({
                where: {
                  accID: req.file.originalname,
                  imagePath: "/images/nophoto.jpg",
                },
              });
            }
          });
        res.send(results);
      });
  }
};

const retrieveImages = (req, res) => {
  models.acc_images
    .findAll({
      where: {
        accID: req.params.id,
      },
    })
    .then((results) => {
      res.send(results);
    });
};

module.exports = {
  image: image,
  upload: upload,
  retrieveImages: retrieveImages,
};
