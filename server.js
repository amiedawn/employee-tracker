const express = require('express');

// instantiate the server
const app = express();

// get the client
const mysql = require("mysql2");

// create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test",
});

// simple query
connection.query(
  'SELECT * FROM `table` WHERE `name` = "Page" AND `age` > 45',
  function (err, results, fields) {
    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
  }
);

// with placeholder
connection.query(
  "SELECT * FROM `table` WHERE `name` = ? AND `age` > ?",
  ["Page", 45],
  function (err, results) {
    console.log(results);
  }
);


// make server listen to express.js server
app.listen(3001, () => {
  console.log('API server now on port 3001');
});