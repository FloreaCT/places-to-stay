"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("acc_users", [
      { username: "admin", password: "admin123", admin: 1 },
      { username: "tim", password: "tim123", admin: 0 },
      { username: "kate", password: "kate123", admin: 0 },
      { username: "visithampshire", password: "vh123", admin: 0 },
      { username: "floreact", password: "admin", admin: 1 },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("acc_users", null, {});
  },
};
