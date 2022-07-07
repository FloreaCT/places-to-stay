// load dependencies
require('dotenv').config()
const Sequelize = require("sequelize");
const session = require("express-session");

// initalize sequelize with session store
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// Connect database
const myDatabase = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        logging: false,
        dialect: "mysql",
        storage: "./session.mysql",
        define: {
            underscored: false,
            freezeTableName: false,
            charset: 'utf8',
            dialectOptions: {
                collate: 'utf8_general_ci'
            },
            timestamps: false
        }
    });

const sessionStore = new SequelizeStore({
    db: myDatabase
})

const configSession = (app) => {
    app.use(
        session({
            key: "express.sid",
            secret: "secret",
            storage: sessionStore,
            resave: true,
            saveUninitialized: false,
            cookie: {
                httpOnly: false,
                secure: false,
                maxAge: (24 * 60 * 60 * 1000) // 1 day 
            }

        })
    );
}

// Create db session
sessionStore.sync()

module.exports = { configSession: configSession, myDatabase: myDatabase }