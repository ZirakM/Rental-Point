const express = require("express");
const connection = require("../helpers/database");

router.get("/search:query", (req, res) => {
  if (req.body.query.search) {
  }
  const queries = [
    "SELECT  COUNT(price), location FROM listings WHERE price = ANY (SELECT price from listings WHERE price < 200 GROUP BY location",
    "SELECT * FROM listings WHERE listing_id = (SELECT listing_id FROM listings WHERE location = ?",
    "SELECT accounts.id, accounts.fname, accounts.lname FROM accounts WHERE (id) IN (SELECT id FROM accounts WHERE (id) IN (SELECT accounts.id FROM listings FULL JOIN accounts ON host_id = accounts.id WHERE location = accounts.country) UNION SELECT user_id FROM verified_accoutns WHERE demerit < 3",
    "SELECT accounts.fname, accounts.lname, host_id, listing_id FROM listings FULL JOIN accounts ON host_id = accounts.id WHERE location = accounts.country",
  ];
  connection().query(queries.join(";"), function (error, results, fields) {
    res.render("query", {
      budget: results[0][1],
      location: results[1],
      sellers: [2],
      seller: [3],
    });
  });
});
