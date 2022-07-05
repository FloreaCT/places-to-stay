'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class acc_users extends Model {
        toJSON() {
            return {...this.get(), id: undefined }
        }
    }
    acc_users.init({
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        admin: {
            type: DataTypes.TINYINT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }

    }, {
        sequelize,
        modelName: 'acc_users',
    });
    return acc_users;
};