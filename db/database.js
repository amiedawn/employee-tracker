// create the connection to database
const mysql = require("mysql2");

//constructor function
class Database {
  constructor(config) {
    this.connection = mysql.createConnection(config);
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      console.log("this is it");

      this.connection.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        console.log("made it");
        resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err)
          return reject(err);
        resolve();
      });
    });
  }
};

module.exports = Database;