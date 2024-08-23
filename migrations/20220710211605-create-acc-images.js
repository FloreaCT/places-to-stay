"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("acc_images", {
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
      approved: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      imagePath: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("acc_images");
  },
};
