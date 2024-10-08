"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("acc_dates", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      accID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      thedate: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      availability: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        defaultValue: 20,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("acc_dates");
  },
};
