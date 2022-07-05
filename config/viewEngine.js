const express = require('express');

// Configuring the view engine

module.exports = {
    configViewEngine(app) {
        app.use(express.static('./public'));
        app.set('view engine', 'ejs')
        app.set('views', './views')
    }
}