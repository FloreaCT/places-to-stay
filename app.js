require('dotenv').config()
const express = require('express');
const configViewEngine = require('./config/viewEngine')
const { initAllWebRoute } = require('./routes/web')
const { initAllAccRoute } = require('./routes/accommodation')
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const configSession = require('./config/session');
const db = require("./config/session");
const passport = require('passport');
const cors = require('cors')
const app = express()


const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

//Using cors
app.use(cors());

// Configuring server for cookies
app.use(cookieParser('secret'))

// Showing the meessage to the user
app.use(flash())

// Configuring body-parser for post
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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

// Handle 404
app.use(function(req, res) {
    res.status(404).render('404');
});

const port = process.env.PORT || 3030;

app.listen(port,
    console.log(`The application is running on port number ${port}`)
)

/*
app.delete('/products/:id', (req, res) => {
    con.query('DELETE FROM products WHERE id=?', [req.params.id], (error,results,fields)=> {
        if(error) {
            res.status(500).json({error: error});
        } else if(results.affectedRows==1) {
            res.json({'message': 'Successfully deleted.'});
        } else {
            res.status(404).json({error: 'Could not delete: could not find a record matching that ID'});
        }
    } );
});

This will tell Express to serve all content in the public folder as static pages. So to access the file file.html inside the public folder from the browser, you can access it via https://url-of-your-server.example.com/file.html.



*/