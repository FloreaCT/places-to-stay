'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class acc_bookings extends Model {
        toJSON() {
            return {...this.get(), id: undefined }
        }
    }
    acc_bookings.init({
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
        username: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        npeople: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }

    }, {
        sequelize,
        modelName: 'acc_bookings',
        timestamps: false,
        createdAt: false,
        updatedAt: false
    });
    return acc_bookings;
};