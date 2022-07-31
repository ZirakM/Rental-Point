// Declare require statements, express to validate endpoints and dayjs
// to work with dates much more easily
const express = require("express");
const dayjs = require("dayjs");

// Creates an express router, that allows us to modulate our express endpoints
const router = express.Router();

// getConnection is imported to allow us to connect to the database, with
// capitilize to sanitize input from user forms
const connection = require("../helpers/database");
const capitilize = require("../helpers/capitalize");

// Requiring isSameOrBefore allows us to take advantage of dayjs function that
// returns a boolean based on where a date lays
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

// Allows the use form request to be in json objects for us to manipulate and
// work with
router.use(express.json());

// The listings endpoint, that provides listings based on country of the respective
// account within the session alongside making queries to retrieve listing information
// and whether an account is a seller
router.get("/listings", (req, res) => {
  if (req.session.loggedin) {
    const queries = [
      "SELECT country FROM accounts WHERE id = ?",
      "SELECT full_listings.listing_id, full_listings.location, DATE_FORMAT(full_listings.avaliable_start, '%Y/%m/%d') AS avaliable_start,DATE_FORMAT(full_listings.avaliable_end, '%Y/%m/%d') AS avaliable_end, listing_car.manufacturer, listing_car.model, listing_car.car_year, accounts.fname, accounts.lname, DATE_FORMAT(full_listings.datecreated, '%Y/%m/%d') AS datecreated, listing_car.seats, listing_car.state, full_listings.price, full_listings.picture FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id JOIN accounts ON full_listings.host_id = accounts.id WHERE full_listings.location=?",
      "SELECT isSeller FROM verified_accounts, accounts WHERE verified_accounts.user_id = accounts.id AND accounts.email = ?",
    ];
    // If the account is found to be a seller, an add listing button will be avaliable to
    // that respective user and will be rendered in listings.hbs
    connection().query(
      queries.join(";"),
      [req.session.userid, req.session.location, req.session.username],
      function (error, results, fields) {
        res.render("listings", {
          loggedIn: req.session.loggedin,
          results: results[1],
          isSeller: true ? results[2].length > 0 : false,
        });
      }
    );
  } else {
    // If the user is not logged in they will be redirected to the login page
    res.redirect("/login");
  }
});

// A GET endpoint which renders the add listings form
router.get("/listings/add", (req, res) => {
  res.render("listings-add", {
    loggedIn: req.session.loggedin,
  });
});

// A POST endpoint that will POST the form if the inputs align with the requirements
// that are set within the website
router.post("/listings/add", (req, res) => {
  // Only allows users to POST if they are logged in
  if (req.session.loggedin) {
    // Checks whether all input fields have been filled
    if (
      req.body.manufacturer &&
      req.body.model &&
      req.body.country !== "None" &&
      req.body.seats &&
      req.body.condition &&
      req.body.datestart &&
      req.body.dateend &&
      req.body.price &&
      req.body.year &&
      (req.files || Object.keys(req.files).length > 0)
    ) {
      // Declares information related to the dates, to later send information pertaining
      // to the listing
      const start = dayjs(req.body.datestart);
      const end = dayjs(req.body.dateend);
      const now = dayjs();

      // Conditions that must be met in order to continue with the posting of the listing:
      // The end must start after the start date of the listing
      if (start.diff(end, "day", true) >= 0) {
        res.render("listings-add", {
          errorMessage:
            "The end date must be set to a later date, a date later than the start date",
          loggedIn: req.session.loggedin,
        });
        // This declares that all listings must occur after the current date
      } else if (now.diff(start, "day", true) > 0) {
        res.render("listings-add", {
          errorMessage:
            "The start date must at least start after today, so begin your listing starting tomorrow",
          loggedIn: req.session.loggedin,
        });
        // Ensures that the condition is in between 10 and 1
      } else if (req.body.condition > 10 || req.body.condition < 1) {
        res.render("listings-add", {
          errorMessage: "The condition input field is not an acceptable value",
          loggedIn: req.session.loggedin,
        });
        // Ensures that the seats is in between 10 and 1
      } else if (req.body.seats > 10 || req.body.seats < 1) {
        res.render("listings-add", {
          errorMessage: "The car capacity should qualify as a consumer vehicle",
          loggedIn: req.session.loggedin,
        });
        // Ensures that the price is above 0
      } else if (req.body.price < 0) {
        res.render("listings-add", {
          errorMessage: "The price must be an acceptable value",
          loggedIn: req.session.loggedin,
        });
        // Ensures that the car is at least from 2010
      } else if (req.body.year < 2010) {
        res.render("listings-add", {
          errorMessage: "The car year must be at least from 2010",
          loggedIn: req.session.loggedin,
        });
      } else {
        // After all conditions have been met, this allows us to insert information
        // into the listings and the listings_car table
        let imageFile;
        let uploadPath;
        // Gets the file information that was passed into the form
        imageFile = req.files.imageFile;
        // The upload path relative to the current project, where the image will be sent
        uploadPath = process.cwd() + "/public/images/" + imageFile.name;
        // If the image is able to be uploaded, the form will succeed through the
        // mv function that is associated with the current image that passes the reference
        imageFile.mv(uploadPath, function (error) {
          // If there is an error with uploading the image then an errorMessage is
          // rendered to the listings-add.hbs
          if (error) {
            res.render("listings-add", {
              errorMessage: "There was a problem uploading your image",
              loggedIn: req.session.loggedin,
            });
          }
          // If there is no error, we will continue through the connection queries and insert
          // into the listings and listing_car tables
          connection().query(
            "INSERT INTO listings(host_id, price, picture, avaliable_start, avaliable_end, location) VALUES(?, ?, ?, ?, ?, ?)",
            [
              req.session.userid,
              Math.round(req.body.price * 100) / 100,
              imageFile.name,
              req.body.datestart,
              req.body.dateend,
              req.body.country,
            ],
            function (error, results, fields) {
              connection().query(
                "INSERT INTO listing_car(listing_id, manufacturer, model, car_year, seats, state) VALUES(?, ?, ?, ?, ?, ?)",
                [
                  results.insertId,
                  capitilize(req.body.manufacturer),
                  capitilize(req.body.model),
                  req.body.year,
                  req.body.seats,
                  req.body.condition,
                ],
                function (error, results, fields) {
                  // After the success of both the insert statements user will be redirected to the
                  // the "/listings" endpoint
                  res.redirect("/listings");
                }
              );
            }
          );
        });
      }
    } else {
      // If an input field is missing, there will be a message that says there are input fields that need to be filled
      res.render("listings-add", {
        loggedIn: req.session.loggedin,
        errorMessage: "All input fields must be filled in",
      });
    }
  } else {
    // If a user is not loggedin, the will be redirected to the login page
    res.redirect("/login");
  }
});

// The POST endpoint for the quick search, based on location and number of seats, renders such results to
// the carlistings.hbs page
router.post("/search", (req, res) => {
  connection().query(
    "SELECT fname, lname, price,DATE_FORMAT(datecreated, '%Y/%m/%d') AS datecreated, DATE_FORMAT(avaliable_start, '%Y/%m/%d') as avaliable_start, DATE_FORMAT(avaliable_end, '%Y/%m/%d') AS avaliable_end, location, manufacturer, model, car_year, seats, state, price, full_listings.picture AS picture FROM accounts, listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id  WHERE full_listings.location = ? AND listing_car.seats = ? AND accounts.id = host_id",
    [req.body.locationSearch, req.body.seatSearch],
    function (error, results, fields) {
      res.render("carlistings", {
        results: results,
        loggedIn: req.session.loggedin,
      });
    }
  );
});

// The GET endpoint that is displays a product page based on the listing id that retrieved from the user click
// that sends a req.params json to the router
router.get("/listings/:id", (req, res) => {
  if (req.session.loggedin) {
    const queries = [
      "SELECT DATE_FORMAT(datecreated, '%Y-%m-%d') AS date_created, DATE_FORMAT(avaliable_start, '%Y-%m-%d') AS start_date, DATE_FORMAT(avaliable_end, '%Y-%m-%d') AS end_date FROM listings WHERE listing_id = ?",
      "SELECT full_listings.picture, full_listings.listing_id, DATE_FORMAT(full_listings.datecreated, '%Y-%m-%d') AS datecreated, accounts.email, accounts.fname, accounts.lname, full_listings.price, full_listings.location, listing_car.manufacturer, listing_car.model, listing_car.car_year, listing_car.state, listing_car.seats FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id JOIN accounts ON accounts.id = full_listings.host_id WHERE full_listings.listing_id = ?",
      "SELECT DATE_FORMAT(pickup, '%Y-%m-%d') AS 'from', DATE_FORMAT(dropoff, '%Y-%m-%d') AS 'to' FROM rented_cars WHERE rented_cars.listing_id = ?",
    ];
    connection().query(
      queries.join(";"),
      [req.params.id, req.params.id, req.params.id],
      function (error, results, fields) {
        const currentDate = dayjs();
        // Renders the product.hbs page with information regarding the start date, isAvaliable and information that
        // is passed to the calendar
        res.render("product", {
          loggedIn: req.session.loggedin,
          endDate: results[0][0].end_date,
          startDate: results[0][0].start_date,
          isAvaliable: dayjs(results[0][0].end_date).isSameOrBefore(
            currentDate,
            "day"
          ),
          disable: JSON.stringify(results[2]),
          results: results[1][0],
        });
      }
    );
  } else {
    // If a user is not loggedin, the will be redirected to the login page
    res.redirect("/login");
  }
});

// The POST endpoint that will take the input of the dates that are selected in the calendar
router.post("/listings/:id", (req, res, next) => {
  // Continues along if the user is loggedin
  if (req.session.loggedin) {
    // Continues along if the calendar is filled in
    if (req.body.calendar) {
      // Selects information pertaining to the listing that is clicked on, based on the req.params
      // object that holds the id of the listing
      connection().query(
        "SELECT * FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id WHERE full_listings.listing_id = ?",
        [req.params.id],
        function (error, results, fields) {
          // Works with the dates get the request start and end date for the listing
          const dates = req.body.calendar.split(" to ");
          // Determines the number of days chosen
          const numberDays =
            dates.length > 1
              ? 1 + dayjs(dates[1]).diff(dayjs(dates[0]), "day")
              : 1;
          // Renders the checkout.hbs page with results gathered from the product.hbs calendar form
          res.render("checkout", {
            listing_id: req.params.id,
            from: dates[0],
            to: dates[1],
            days:
              dates.length > 1
                ? 1 + dayjs(dates[1]).diff(dayjs(dates[0]), "day")
                : 1,
            results: results[0],
            loggedIn: req.session.loggedin,
            price: (numberDays * results[0].price).toFixed(2),
          });
          // Sets the req.session object with the order information
          req.session.fromDate = dates[0];
          req.session.toDate = dates[1] ? dates[1] : dates[0];
          req.session.price = numberDays * results[0].price;
          req.session.locationListing = results[0].location;
          req.session.carId = results[0].car_id;
        }
      );
    } else {
      // Redirects back to the previous page if there is a problem with the POST endpoint
      res.redirect("back");
    }
  } else {
    // If a user is not loggedin, the will be redirected to the login page
    res.redirect("/login");
  }
});

// The POST endpoint for the checkout.hbs form where the order information is inserted into rented_cars
router.post("/listings/:id/checkout", (req, res, next) => {
  // Continues along if the user is loggedin
  if (req.session.loggedin) {
    // Continues along if there is a carId and a listing_id in the req.session page
    if (req.session.carId && req.params.id) {
      connection().query(
        "INSERT INTO rented_cars(listing_id, car_id, buyer_id, pickup, dropoff, location, price) VALUES(?, ?, ?, ?, ?, ?, ?)",
        [
          req.params.id,
          req.session.carId,
          req.session.userid,
          req.session.fromDate,
          req.session.toDate,
          req.session.locationListing,
          req.session.price,
        ],
        function (error, results, fields) {
          // If there is an error rendering, then the about page will render with an error message
          if (error) {
            res.render("about", {
              errorMessage:
                "There was a problem with your order, try again later",
              loggedIn: req.session.loggedin,
            });
          } else {
            // If there were no problems inserting the order, then the req.session page is cleaned
            // and the order is successfully made which will render on the about.hbs page
            req.params.id = null;
            req.session.carId = null;
            req.session.fromDate = null;
            req.session.toDate = null;
            req.session.locationListing = null;
            req.session.price = null;
            res.render("about", {
              successMessage: "Your order has been successfully made",
              loggedIn: req.session.loggedin,
            });
          }
        }
      );
    } else {
      // If there is a problem posting the form, then there is an error message that is rendered
      // on the about.hbs page
      res.render("about", {
        errorMessage: "There was a problem with your order, try again later",
        loggedIn: req.session.loggedin,
      });
    }
  } else {
    // If a user is not loggedin, the will be redirected to the login page
    res.redirect("/login");
  }
});

// Exports all of the endpoints that are on this current router
module.exports = router;
