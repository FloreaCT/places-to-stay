"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("acc_dates", [
      { accID: 1, thedate: 240901 },
      { accID: 1, thedate: 240904 },
      { accID: 2, thedate: 240907 },
      { accID: 1, thedate: 240901 },
      { accID: 1, thedate: 240904 },
      { accID: 1, thedate: 240906 },
      { accID: 2, thedate: 240907 },
      { accID: 2, thedate: 2409012 },
      { accID: 2, thedate: 240913 },
      { accID: 3, thedate: 240901 },
      { accID: 3, thedate: 240902 },
      { accID: 3, thedate: 240903 },
      { accID: 4, thedate: 240903 },
      { accID: 4, thedate: 240910 },
      { accID: 4, thedate: 240920 },
      { accID: 5, thedate: 240901 },
      { accID: 5, thedate: 240902 },
      { accID: 5, thedate: 240903 },
      { accID: 6, thedate: 240903 },
      { accID: 6, thedate: 240905 },
      { accID: 6, thedate: 240906 },
      { accID: 7, thedate: 240901 },
      { accID: 7, thedate: 240902 },
      { accID: 7, thedate: 240903 },
      { accID: 8, thedate: 240920 },
      { accID: 8, thedate: 240921 },
      { accID: 8, thedate: 240925 },
      { accID: 9, thedate: 240901 },
      { accID: 9, thedate: 240910 },
      { accID: 9, thedate: 240920 },
      { accID: 10, thedate: 240901 },
      { accID: 10, thedate: 240902 },
      { accID: 10, thedate: 240903 },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("acc_dates", null, {});
  },
};
