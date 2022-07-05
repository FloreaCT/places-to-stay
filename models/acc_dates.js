'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class acc_dates extends Model {
        toJSON() {
            return {...this.get(), id: undefined }
        }
    }
    acc_dates.init({
        accID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        thedate: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        availability: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }

    }, {
        sequelize,
        modelName: 'acc_dates',
        timestamps: false,
        createdAt: false,
        updatedAt: false
    });
    return acc_dates;
};