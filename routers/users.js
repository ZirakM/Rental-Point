// Declare require statements, express to validate endpoints and dayjs
// to work with dates much more easily alongside express-session, which lets us store
// information in a req.session object and finally the express-fileupload that allows us to
// work with and upload images
const express = require("express");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const dayjs = require("dayjs");

// getConnection is imported to allow us to connect to the database, with
// capitilize to sanitize input from user forms
const connection = require("../helpers/database");
const capitalize = require("../helpers/capitalize");

// Requiring relativeTime allows us to take advantage of dayjs function that
// tells us how much time has passed between a set of dates
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

// Creates an express router, that allows us to modulate our express endpoints
const router = express.Router();

// This saves the session information and settings within this current router
router.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// This allows the router to work with file uploads, which is called using express-fileupload
router.use(fileUpload());

// The GET endpoint for the login page
router.get("/login", (req, res) => {
  // If the user is loggedin, they will be redirected to the "/account" endpoint
  if (req.session.loggedin) {
    res.redirect("/account");
  }
  // If they aren't loggedin, it will render the login page
  res.render("login", { loggedIn: req.session.loggedin });
});

// The POST endpoint for the login page, where if the email and password are the right combination in the accounts database
// it will log us into the system
router.post("/login", (req, res) => {
  // Ensures that the username and password fields are filled
  if (req.body.username && req.body.password) {
    connection().query(
      "SELECT * FROM accounts WHERE email = ? AND password = ?",
      [req.body.username, req.body.password],
      function (error, results, fields) {
        // If there is a non empty array, it logs into the system and redirects to the home page
        // while setting the session information
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = req.body.username;
          req.session.userid = results[0].id;
          req.session.location = results[0].country;
          res.redirect("/");
        } else {
          // If the results array is empty, an error message will be displayed in the login.hbs page
          res.render("login", {
            errorMessage: "No account can be found matching your credentials",
            loggedIn: req.session.loggedin,
          });
        }
      }
    );
  } else {
    // Renders an error message if the input fields aren't filled
    res.render("login", {
      errorMessage: "Please fill in all login details",
      loggedIn: req.session.loggedin,
    });
  }
});

// The GET endpoint for the "/register" page
router.get("/register", (req, res) => {
  // If the user is loggedin, it will redirect the user to the "/account" endpoint instead
  if (req.session.loggedin) {
    res.redirect("/account");
  }
  // If the user is not logged in, it will render the register.hbs page
  res.render("register", {
    loggedIn: req.session.loggedin,
  });
});

// The POST endpoint for the "/register" page
router.post("/register", (req, res) => {
  // Continues along if all input fields are filled in
  if (
    req.body.fname &&
    req.body.lname &&
    req.body.country !== "None" &&
    req.body.date &&
    req.body.email &&
    req.body.password &&
    req.body.confirm
  ) {
    connection().query(
      "SELECT * FROM accounts WHERE email=?",
      [req.body.email],
      function (error, results, fields) {
        // Ensures that the email is not already taken
        if (results.length > 0) {
          res.render("register", {
            errorMessage: "The email is already taken, try another one",
            loggedIn: req.session.loggedin,
          });
          // Ensures that the password and confirm password fields match
        } else if (req.body.password !== req.body.confirm) {
          res.render("register", {
            errorMessage: "The passwords don't match, please try again",
            loggedIn: req.session.loggedin,
          });
          // Ensures that the password is at least the length of 8 or more
        } else if (
          req.body.password.length < 8 ||
          req.body.confirm.length < 8
        ) {
          res.render("register", {
            errorMessage: "Chosen password must be at least 8 characters",
            loggedIn: req.session.loggedin,
          });
          // Ensures that the account being created has a user of at least 18 years old
        } else if (parseFloat(dayjs(req.body.date).toNow(true)) < 18) {
          res.render("register", {
            errorMessage:
              "You need to be at least 18 years old to make an account",
            loggedIn: req.session.loggedin,
          });
          // Ensures that the user is not already loggedin
        } else if (req.session.loggedIn) {
          res.render("register", {
            errorMessage:
              "You are already logged in, please logout before proceeding",
            loggedIn: req.session.loggedin,
          });
          // If all previous conditions are met, the user information will be inserted into the accounts form
        } else {
          connection().query(
            "INSERT INTO accounts(fname, lname, email, country, birthdate, password) VALUES(?,?,?,?,?,?)",
            [
              capitalize(req.body.fname),
              capitalize(req.body.lname),
              req.body.email,
              req.body.country,
              req.body.date,
              req.body.password,
            ],
            function (error, results, fields) {
              // Renders a success message on the login.hbs page
              res.render("login", {
                successMessage:
                  "Congratulations, you have registered. Log in below",
                loggedIn: req.session.loggedin,
              });
            }
          );
        }
      }
    );
    // If all input fields aren't filled, it renders an error message
  } else {
    res.render("register", {
      errorMessage: "All input fields must be filled in",
      loggedIn: req.session.loggedin,
    });
  }
});

// The GET endpoint for the "/seller" page
router.get("/seller", (req, res) => {
  // If the user is loggedin, it will redirect the user "/account" endpoint
  if (req.session.loggedin) {
    res.redirect("/account");
  }
  // Otherwise it will render the register-seller.hbs page
  res.render("register-seller", {
    loggedIn: req.session.loggedin,
  });
});

// The POST endpoint for the "/seller" page which will create an account for a seller account
router.post("/seller", (req, res) => {
  // Continues through to more validation if all input fields are filled
  if (
    req.body.fname &&
    req.body.lname &&
    req.body.country !== "None" &&
    req.body.date &&
    req.body.email &&
    req.body.password &&
    req.body.confirm &&
    req.body.phone &&
    req.body.license
  ) {
    connection().query(
      "SELECT * FROM accounts WHERE email=?",
      [req.body.email],
      function (error, results, fields) {
        // Ensures that the email is not already taken
        if (results.length > 0) {
          res.render("register-seller", {
            errorMessage: "The email is already taken, try another one",
            loggedIn: req.session.loggedin,
          });
          // Ensures that the password and confirm password fields match
        } else if (req.body.password !== req.body.confirm) {
          res.render("register-seller", {
            errorMessage: "The passwords don't match, please try again",
            loggedIn: req.session.loggedin,
          });
          // Ensures that the password is at least the length of 8 or more
        } else if (
          req.body.password.length < 8 ||
          req.body.confirm.length < 8
        ) {
          res.render("register-seller", {
            errorMessage: "Chosen password must be at least 8 characters",
            loggedIn: req.session.loggedin,
          });
          // Ensures that the account being created has a user of at least 18 years old
        } else if (parseFloat(dayjs(req.body.date).toNow(true)) < 18) {
          res.render("register-seller", {
            errorMessage:
              "You need to be at least 18 years old to make an account",
            loggedIn: req.session.loggedin,
          });
          // Ensures that the user is not already loggedin
        } else if (req.session.loggedIn) {
          res.render("register", {
            errorMessage:
              "You are already logged in, please logout before proceeding",
            loggedIn: req.session.loggedin,
          });
          // If all previous conditions are met, the user information will be inserted into the accounts form
        } else {
          connection().query(
            "INSERT INTO accounts(fname, lname, email, country, birthdate, password) VALUES(?,?,?,?,?,?)",
            [
              capitalize(req.body.fname),
              capitalize(req.body.lname),
              req.body.email,
              req.body.country,
              req.body.date,
              req.body.password,
            ],
            function (error, results, fields) {
              // If the user conditions are met and the req.body object is inserted into the accounts table
              // then the login.hbs page will render a success message
              res.render("login", {
                successMessage:
                  "Congratulations, you have registered as a seller. Log in below",
                loggedIn: req.session.loggedin,
              });
              // This will continue along, inserting into the verified_accounts table as well
              connection().query(
                "INSERT INTO verified_accounts(user_id, license, isSeller, phone) VALUES(?, ?, ?, ?)",
                [results.insertId, req.body.license, 1, req.body.phone]
              );
            }
          );
        }
      }
    );
    // If the input fields aren't filled, an error message will be displayed
  } else {
    res.render("register-seller", {
      errorMessage: "All input fields must be filled in",
      loggedIn: req.session.loggedin,
    });
  }
});

// The GET endpoint for the "/account" page that displays relevant user information
router.get("/account", (req, res) => {
  // Continue along if the user is loggedin
  if (req.session.loggedin) {
    // Queries are related to account information, whether a person is a verified seller, listing information
    // that the account has created, the ability to delete listings along with fulfilled orders alongside the
    // ability to change country of the account
    const queries = [
      "SELECT fname, lname, country, email, DATE_FORMAT(birthdate, '%Y/%m/%d') AS birthdate  FROM accounts WHERE email=?",
      "SELECT isSeller FROM verified_accounts, accounts WHERE verified_accounts.user_id = accounts.id AND accounts.email = ?",
      "SELECT listings.price, listings.picture AS picture, full_listings.state, full_listings.manufacturer, full_listings.model, full_listings.car_year, listings.listing_id, host_id, DATE_FORMAT(datecreated, '%Y/%m/%d') AS datecreated, price, DATE_FORMAT(avaliable_start, '%Y/%m/%d') AS start, DATE_FORMAT(avaliable_end,'%Y/%m/%d') AS end, location FROM listings JOIN listing_car AS full_listings ON listings.listing_id = full_listings.listing_id WHERE host_id IN (SELECT user_id FROM verified_accounts,accounts WHERE accounts.email=? AND verified_accounts.user_id = accounts.id)",
      "SELECT DATE_FORMAT(rented_cars.datecreated, '%Y/%m/%d') AS datecreated, rented_cars.order_id, DATE_FORMAT(rented_cars.pickup, '%Y/%m/%d') AS pickup, DATE_FORMAT(rented_cars.dropoff, '%Y/%m/%d') AS dropoff, listing_car.manufacturer, listing_car.model, listing_car.car_year, rented_cars.location, accounts.email, accounts.fname, accounts.lname, full_listings.picture AS picture,full_listings.price, rented_cars.price AS total FROM listings AS full_listings JOIN rented_cars ON rented_cars.listing_id = full_listings.listing_id JOIN accounts ON accounts.id = full_listings.host_id JOIN listing_car ON listing_car.car_id = rented_cars.car_id WHERE rented_cars.buyer_id=?",
      "SELECT DATE_FORMAT(full_listings.datecreated, '%Y/%m/%d') AS purchaseDate, full_listings.price, full_listings.order_id, DATE_FORMAT(full_listings.pickup, '%Y/%m/%d') AS pickup, DATE_FORMAT(full_listings.dropoff, '%Y/%m/%d') AS dropoff, listing_car.manufacturer, listing_car.model, listing_car.car_year, accounts.email, accounts.fname, accounts.lname, listing_car.state, full_listings.location FROM rented_cars AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id JOIN accounts ON full_listings.buyer_id = accounts.id WHERE full_listings.listing_id IN(SELECT listing_id FROM listings WHERE listings.host_id = ?) ORDER BY full_listings.order_id DESC",
    ];
    connection().query(
      queries.join(";"),
      [
        req.session.username,
        req.session.username,
        req.session.username,
        req.session.userid,
        req.session.userid,
      ],
      function (error, results, fields) {
        // Renders all the information that is gathered from the queries above
        res.render("account", {
          loggedIn: req.session.loggedin,
          accountDetails: results[0][0],
          registeredSeller: true ? results[1].length > 0 : false,
          orders: results[3],
          listings: results[2],
          fulfilled: results[4],
        });
      }
    );
  } else {
    // If the user is not loggedin, then the page will be redirected to the login page
    res.redirect("/login");
  }
});

// The POST endpoint for the "/account" page, that allows users to update account information
router.post("/account", (req, res) => {
  // If the user is loggedin, continue along
  if (req.session.loggedin) {
    // Checks whether there is a req.body object change
    if (req.body.changeLocation && req.body.changeLocation !== "None") {
      // This sets the session location for the user
      req.session.location = req.body.changeLocation;
      // The update query that will set the country of the user in question
      connection().query(
        "UPDATE accounts SET country=? WHERE id=?",
        [req.body.changeLocation, req.session.userid],
        function (error, results, fields) {
          // After updating the account information, this will redirect to the "/account" endpoint
          res.redirect("/account");
        }
      );
      // If conditions aren't met, it will redirect to the "/account" endpoint
    } else {
      res.redirect("/account");
    }
    // If not loggedin this will redirect to the "/login" endpoint
  } else {
    res.redirect("/login");
  }
});

// The "/account" endpoint that allows the deletion of orders pertaining to the user
router.get("/account/:id", (req, res) => {
  // If the user is loggedin
  if (req.session.loggedin) {
    // Allows the deletion of foreign key checks
    const queries = [
      "SET FOREIGN_KEY_CHECKS=?",
      "DELETE full_listings, listing_car FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id WHERE full_listings.listing_id=?",
      "SET FOREIGN_KEY_CHECKS=?",
    ];
    // Query that will allow a user to delete based on listing_id
    connection().query(
      queries.join(";"),
      [0, req.params.id, 1],
      function (error, results, fields) {
        // Redirects to the "/account" endpoint
        res.redirect("/account");
      }
    );
    // If user is not loggedin, it will redirect to the "/login" endpoint
  } else {
    res.redirect("/login");
  }
});

// Exports all of the endpoints that are on this current router
module.exports = router;
