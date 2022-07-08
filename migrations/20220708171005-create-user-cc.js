'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('userCCs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            cardHolder: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }

            },
            cardNumber: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            cardCVC: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                }

            },
            expYear: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                }

            },
            expMonth: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                }

            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }, {
            timestamps: false
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('userCCs');
    }
};