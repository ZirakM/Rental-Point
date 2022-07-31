// Declares the require statements, with express being used for endpoints
// and the getConnection function being imported from database
const express = require("express");
const connection = require("../helpers/database");

// Creates an express router, that allows us to modulate our express endpoints
const router = express.Router();

// Home page endpoint, with a query that selects basic listing information
// and passes it along to the main.hbs file
router.get("", (req, res) => {
  connection().query(
    "SELECT fname, lname, seats, state, location, manufacturer, model, car_year, picture FROM listings JOIN listing_car ON listings.listing_id = listing_car.listing_id JOIN accounts ON listings.host_id = accounts.id ORDER BY datecreated DESC LIMIT 6",
    function (error, results, fields) {
      if (error) throw error;
      res.render("main", {
        results: results,
        loggedIn: req.session.loggedin,
      });
    }
  );
});

// About page endpoint, with a query that counts the number of accounts, listings
// and cars that have been added to the website and renders this information to
// the about.hbs page
router.get("/about", (req, res) => {
  connection().query(
    "SELECT  COUNT(DISTINCT accounts.id) AS users, COUNT(DISTINCT listings.listing_id) AS listings, COUNT(DISTINCT listing_car.car_id) AS cars FROM accounts, listings, listing_car",
    function (error, results, fields) {
      res.render("about", {
        users: results[0].users,
        listings: results[0].listings,
        cars: results[0].cars,
        loggedIn: req.session.loggedin,
      });
    }
  );
});

// The logout endpoint, that destroys the req.session object that previously held
// session information pertaining to the user
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Exports all of the endpoints that are on this current router
module.exports = router;
