"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("acc_amenities", [
      {
        accID: 1,
        wifi: true,
        air: true,
        breakfast: true,
        animals: true,
        parking: true,
        toiletries: true,
      },
      {
        accID: 2,
        wifi: false,
        air: true,
        breakfast: true,
        animals: false,
        parking: true,
        toiletries: true,
      },
      // Add all other entries here...
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("acc_amenities", null, {});
  },
};
