const express = require("express");
const path = require("path");

// Configuring the view engine and serving static files
module.exports = {
  configViewEngine(app) {
    console.log("Path is ", path.join(__dirname, "../views"));

    // Set the view engine to EJS
    app.set("view engine", "ejs");
    app.engine("ejs", require("ejs").__express);
    app.set("views", path.join(__dirname, "../views"));

    // Serve static files from the 'public' directory
    app.use(express.static(path.join(__dirname, "../public")));
  },
};
