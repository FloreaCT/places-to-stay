const { validationResult } = require("express-validator")
const loginService = require("../services/loginService")
const db = require('../config/session')
const randtoken = require('rand-token');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt')

require('dotenv').config()

let getPageLogin = (req, res) => {
    return res.render("login.ejs", {
        errors: req.flash("errors")
    });
};

let checkLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/404.ejs')
    }
    next()
}

let checkLoggedOut = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/")
    }
    next()
}

let postLogOut = (req, res) => {
    req.session.destroy(function(error) {
        if (error) throw error
        return res.redirect('/')
    })
}

let checkRole = (req, res, next) => {
    if (req.user.roleId == 3) {
        return 3
    } else {
        // TODO: RENDER
        next()
            // res.redirect("/")
    }
}

let checkInstitute = (req, res, next) => {
    if (!req.user.roleId == 2) {
        return res.redirect('/profile')
    }
    next()
}

let checkUser = (req, res, next) => {
    if (!req.user.roleId == 1) {
        return res.redirect('/profile')
    }
    next()
}


let sendEmail = function(email, token) {

    var email = email;
    var token = token;

    var mail = nodemailer.createTransport({
        service: "gmail.com",
        port: 465,
        secure: true, // use SSL
        ignoreTLS: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    });

    console.log(process.env.EMAIL_USER);
    var mailOptions = {
        from: 'password_recovery@opendays.com',
        to: email,
        subject: 'Reset Password Link - OpenDays.com',
        html: '<p>You requested for reset password, kindly use this <a href="http://localhost:3030/updatePassword?token=' + token + '">link</a> to reset your password</p><br><br><br><p>Best regards,<br>OpenDays Team</br>' // TODO: Change this to open-days.herokuapp.com 

    };

    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log("Email was sent")
        }
    });
}

let passwordRecovery = async function(req, res, next) {

    var email = req.body.email;

    await db.myDatabase.query('SELECT * FROM users WHERE email ="' + email + '"').then(result => {

        var type = ''
        var msg = ''

        if (result[0].length > 0) {

            var token = randtoken.generate(20);

            var sent = sendEmail(email, token);

            if (sent != '0') {

                db.myDatabase.query(`UPDATE users SET token = "${token}" WHERE email = "${email}"`)

                res.write(`<script>window.alert("The reset password link has been sent to your email address. Please check your SPAM folder!");window.location="/";</script>`)


            } else {
                type = 'error';
                msg = 'Something goes to wrong. Please try again';
            }

        } else {
            res.write(`<script>window.alert("If the email is in our database, you will receive shortly a password reset link!");window.location="/";</script>`)

        }
    })
}


let passwordUpdate = async function(req, res, next) {

    var token = req.body.token;
    var password = req.body.password;

    if (req.body.token.length == 20) {
        await db.myDatabase.query('SELECT * FROM users WHERE token ="' + token + '"').then(result => {

            var type
            var msg

            if (result[0].length > 0) {

                var saltRounds = 10;

                // var hash = bcrypt.hash(password, saltRounds);

                bcrypt.genSalt(saltRounds, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {

                        // var data = hash

                        db.myDatabase.query(`UPDATE users SET password = "${hash}" WHERE email ="${result[0][0].email}"`)
                        db.myDatabase.query(`UPDATE users SET token = "" WHERE email ="${result[0][0].email}"`)
                    });
                });

                res.write(`<script>window.alert("Password change successfully!");window.location="/";</script>`)

            } else {

                res.write(`<script>window.alert("Invalid Token!");window.location="/";</script>`)

            }

        });
    } else {
        res.write(`<script>window.alert("Invalid Token!");window.location="/";</script>`)
    }
}

module.exports = {
    checkLoggedIn: checkLoggedIn,
    checkLoggedOut: checkLoggedOut,
    postLogOut: postLogOut,
    getPageLogin: getPageLogin,
    checkRole: checkRole,
    checkInstitute: checkInstitute,
    checkUser: checkUser,
    sendEmail: sendEmail,
    passwordRecovery: passwordRecovery,
    passwordUpdate: passwordUpdate
}