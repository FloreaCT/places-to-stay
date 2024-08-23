const db = require('../models')
const bcrypt = require('bcrypt')

let findUserByUser = (loginUser) => {
    return new Promise(async(resolve, reject) => {
        try {
            let user = await db.acc_users.findOne({
                where: {
                    username: loginUser
                }
            })
            if (!user) {
                reject(`${loginUser} is not in our database`)
            } else {
                resolve(user)
            }
        } catch (e) {
            reject(e)
        }
    })
}

let comparePassword = (password, userObject) => {
    return new Promise(async(resolve, reject) => {
        try {

            if (password === userObject.password) {
                resolve(true)
            } else {
                resolve("The password that you have entered is incorrect!")
            }
        } catch (e) {
            reject(e)
        }
    })
}

let findUserById = (idInput) => {
    return new Promise(async(resolve, reject) => {
        try {
            let user = await db.acc_users.findOne({
                where: {
                    id: idInput
                }
            })
            if (!user) reject(` User not found by the id: ${idInput}`)
            resolve(user)
        } catch (err) {
            reject(err)
        }
    })
}


module.exports = {
    findUserByUser: findUserByUser,
    comparePassword: comparePassword,
    findUserById: findUserById,

}