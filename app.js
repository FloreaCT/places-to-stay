require('dotenv').config()
const express = require('express');
const configViewEngine = require('./config/viewEngine')
const { initAllWebRoute } = require('./routes/web')
const { initAllAccRoute } = require('./routes/accommodation')
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const configSession = require('./config/session');
const passport = require('passport');
const valid = require('card-validator')
const cors = require('cors')
const app = express()
    // const path = require('path')
    // app.use(express.static(path.join(__dirname, 'public')))

//Using cors
app.use(cors());

// Configuring server for cookies
app.use(cookieParser('secret'))

// Configuring body-parser for post
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(flash())

// Configuring the view engine
configViewEngine.configViewEngine(app);

// Config app session
configSession.configSession(app)

//Configure passport
app.use(passport.initialize())
app.use(passport.session())


// Initializing all the web routes
initAllAccRoute(app);
initAllWebRoute(app);

const port = process.env.PORT || 3030;

app.listen(port,
    console.log(`The application is running on port number ${port}`)
)