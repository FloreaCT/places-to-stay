'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class acc_users extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
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
        timestamps: false,
        createdAt: false,
        updatedAt: false
    });

    acc_users.associate = (models) => {

        acc_users.hasMany(models.accommodation, {
            as: 'accommodation',
            foreignKey: 'accID',
            onDelete: 'cascade',
            onUpdate: 'cascade'
        })
    }

    return acc_users;
};