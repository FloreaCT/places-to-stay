'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('acc_details', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            accID: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            price: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            rooms: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            room_type: {
                type: DataTypes.STRING,
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
        }).then(function() { queryInterface.sequelize.query("INSERT INTO acc_details(role, createdAt, updatedAt) VALUES ('User', NOW(), NOW()),('Organizer',NOW(), NOW()),('Administrator',NOW(),NOW())") })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('acc_details');
    }
};