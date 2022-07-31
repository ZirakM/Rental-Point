// Declares require statements, needed to create a connection
const mysql = require("mysql2");
const dotenv = require("dotenv"); // Dotenv needed to hide crucial database login information
const path = require("path");
// Creates the path for the dotenv file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Creates a connection, with the information stored in the dotenv file
// Allows for multipleStatements, so multiple queries can be sent
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  multipleStatements: true,
});

// Returns the database connection, in the form of a function to be called anywhere
function getConnection() {
  return connection;
}

// Exports the getConnection function to be used in other parts of the application
module.exports = getConnection;
