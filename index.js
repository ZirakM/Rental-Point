// Declare require statements, express to validate endpoints and express-handlebars
// to allow the use of handlebars templating engine along with fileUpload that allows us
// to upload images and busboy which lets us work with multipart/form-data, such as images
const express = require("express");
const hbs = require("express-handlebars");
const fileUpload = require("express-fileupload");
const busboy = require("connect-busboy");

// Requires all the routers that were modularized for the ease of code, that will be
// set to the main express app
const userRouter = require("./routers/users");
const listingRouter = require("./routers/listings");
const basicRouter = require("./routers/basic");
const path = require("path");

// Declares the main express app, that the routers will be apart of
const app = express();
// The port for the server
const port = process.env.PORT || 3000;

// Declares the settings of the templating engine and the directories corresponding
// to the templating engine
app.engine(
  "hbs",
  hbs({
    layoutsDir: __dirname + "/views/layouts/",
    extname: "hbs",
    partialsDir: __dirname + "/views/partials/",
    defaultLayout: "layout",
  })
);

// Declares the handlebares templating engine as the engine of choice
app.set("view engine", "hbs");

// Sets the path where the handlebars files will be located
app.set("views", path.join(__dirname, "views"));

// Declares the location of static directory, where css, js and image files will be located
// for the handlebar files
app.use(express.static(__dirname + "/public"));

// Support for JSON encoded bodies
app.use(express.json());

// Settings for the urlencoded information
app.use(express.urlencoded({ extended: false }));

// Allows us to work with multipart/form-data, such as images
app.use(busboy());

app.use(fileUpload());

// The main express app uses the userRouter
app.use(userRouter);

// The main express app uses the listingRouter
app.use(listingRouter);

// The main express app uses the basicRouter
app.use(basicRouter);

// Home page endpoint, that redirects to "/home" endpoint
app.get("/", (req, res) => {
  res.redirect("/home");
});

// Express app listens for the port, and allows you to connect via localhost
app.listen(port, () => {
  console.log("Server is up on port " + port);
});

module.exports = app;
