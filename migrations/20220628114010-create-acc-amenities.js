"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("acc_amenities", {
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
      wifi: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        validate: {
          notEmpty: true,
        },
      },
      air: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        validate: {
          notEmpty: true,
        },
      },
      breakfast: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        validate: {
          notEmpty: true,
        },
      },
      animals: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        validate: {
          notEmpty: true,
        },
      },
      parking: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        validate: {
          notEmpty: true,
        },
      },
      toiletries: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          notEmpty: true,
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("acc_amenities");
  },
};
