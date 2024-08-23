"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class acc_images extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  acc_images.init(
    {
      accID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      approved: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      imagePath: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: "acc_images",
      timestamps: false,
      createdAt: false,
      updatedAt: false,
    }
  );

  acc_images.associate = (models) => {
    acc_images.belongsTo(models.accommodation, {
      as: "accommodation",
      foreignKey: "accID",
    });
  };
  return acc_images;
};
