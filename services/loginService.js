const db = require('../models')
const bcrypt = require('bcrypt')

// let handleLogin = (loginUser, password) => {
//     return new Promise(async(resolve, reject) => {
//         //Check if email exists or not

//         let user = await findUserByUser(loginUser);
//         if (user) {
//             //Compare password
//             await bcrypt.compare(password, user.password).then((isMatch) => {
//                 if (isMatch) {
//                     resolve(true);
//                 } else {
//                     reject(`The password that you've entered is incorrect`);
//                 }
//             });
//         } else {
//             reject(`This user email "${email}" doesn't exist`);
//         }
//     });
// };

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

// let comparePassword = (password, userObject) => {
//     return new Promise(async(resolve, reject) => {
//         try {
//             let isMatch = await bcrypt.compare(password, userObject.password)
//             if (isMatch) {
//                 resolve(true)
//             } else {
//                 resolve("The password that you have entered is incorrect!")
//             }
//         } catch (e) {
//             reject(e)
//         }
//     })
// }

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