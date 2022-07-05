'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('accommodation', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            location: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                }
            },
            latitude: {
                type: Sequelize.FLOAT,
                allowNull: false,
                validate: {
                    notEmpty: true
                }

            },
            longitude: {
                type: Sequelize.FLOAT,
                allowNull: false,
                validate: {
                    notEmpty: true
                }

            },
            description: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                }
            }
        }, {
            timestamps: false
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('accommodation');
    }
};