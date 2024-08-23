"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("acc_images", [
      {
        ID: 11,
        accID: 3,
        approved: 1,
        imagePath: "/images/uploadedImages/3/file-1660906311906.jpeg",
      },
      {
        ID: 12,
        accID: 3,
        approved: 1,
        imagePath: "/images/uploadedImages/3/file-1660906316673.jpeg",
      },
      {
        ID: 13,
        accID: 10,
        approved: 1,
        imagePath: "/images/uploadedImages/10/file-1660906331345.jpeg",
      },
      {
        ID: 14,
        accID: 10,
        approved: 1,
        imagePath: "/images/uploadedImages/10/file-1660906334241.jpeg",
      },
      {
        ID: 15,
        accID: 10,
        approved: 1,
        imagePath: "/images/uploadedImages/10/file-1660906336793.jpeg",
      },
      {
        ID: 16,
        accID: 1,
        approved: 1,
        imagePath: "/images/uploadedImages/1/file-1660906344913.jpeg",
      },
      {
        ID: 17,
        accID: 1,
        approved: 1,
        imagePath: "/images/uploadedImages/1/file-1660906347729.jpeg",
      },
      {
        ID: 18,
        accID: 1,
        approved: 1,
        imagePath: "/images/uploadedImages/1/file-1660906350337.jpeg",
      },
      {
        ID: 19,
        accID: 4,
        approved: 1,
        imagePath: "/images/uploadedImages/4/file-1660906361801.jpeg",
      },
      {
        ID: 20,
        accID: 4,
        approved: 1,
        imagePath: "/images/uploadedImages/4/file-1660906364385.jpeg",
      },
      {
        ID: 21,
        accID: 4,
        approved: 1,
        imagePath: "/images/uploadedImages/4/file-1660906368120.jpeg",
      },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("acc_images", null, {});
  },
};
