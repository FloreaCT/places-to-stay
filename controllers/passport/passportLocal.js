const passport = require('passport')
const passportLocal = require('passport-local')
const loginService = require('../../services/loginService')


let LocalStrategy = passportLocal.Strategy

// Initialize passport
let initPassportLocal = () => {
    // Check if email or password exists
    passport.use(new LocalStrategy({
            usernameField: "loginUser",
            passwordField: "loginPassword",
            passReqToCallback: true
        }, async(req, user, password, done) => {
            try {
                await loginService.findUserByUser(user)
                    .then(async(user) => {
                        if (!user) return done(null, false, req.flash("error", "User not found!"))
                        let message = await loginService.comparePassword(password, user)
                        if (message === true) {
                            return done(null, user, null)
                        } else {
                            return done(null, false, req.flash("error", "Password is incorrect"))
                        }
                    }).catch(err => {

                        return done(null, false, req.flash("errors", err))
                    })
            } catch (error) {
                return done(null, false, error)
            }
        }

    ))
}

passport.serializeUser((user, done) => {
    console.log("serialized");
    return done(null, user.id)
})

passport.deserializeUser(async(id, done) => {
    console.log("deserialized");
    await loginService.findUserById(id).then(user => {
        return done(null, user)
    }).catch(error => {

        return done(error, null)
    })
})

module.exports = initPassportLocal