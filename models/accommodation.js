'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class accommodation extends Model {

    }
    accommodation.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
            }
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notEmpty: true
            }

        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notEmpty: true
            }

        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
            }
        }

    }, {
        sequelize,
        modelName: 'accommodation',
        timestamps: false,
        createdAt: false,
        updatedAt: false
    });

    // accommodation.associations = (models) => {
    //     accommodation.belongsToMany(models.User, {
    //             as: 'user',
    //             foreignKey: 'userId',
    //             onDelete: 'cascade',
    //             onUpdate: 'cascade'
    //         }),
    //         Attenders_to.belongsTo(models.Event, {
    //             as: 'event',
    //             foreignKey: 'eventId',
    //             onDelete: 'cascade',
    //             onUpdate: 'cascade'
    //         })
    // }

    return accommodation;
};