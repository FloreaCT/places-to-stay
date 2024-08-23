"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class accommodation extends Model {}
  accommodation.init(
    {
      accID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      county: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: "accommodation",
      timestamps: false,
      createdAt: false,
      updatedAt: false,
    }
  );

  accommodation.associations = (models) => {
    accommodation.belongsTo(models.acc_users, {
      as: "users",
      foreignKey: "accID",
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
      accommodation.hasOne(models.acc_amenities, {
        as: "acc_amenities",
        foreignKey: "accID",
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
      accommodation.hasMany(models.acc_images, {
        as: "acc_images",
        foreignKey: "accID",
        onDelete: "cascade",
        onUpdate: "cascade",
      });
  };

  return accommodation;
};
