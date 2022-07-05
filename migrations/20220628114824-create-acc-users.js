'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('acc_users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            admin: {
                type: Sequelize.TINYINT,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('acc_users');
    }
};