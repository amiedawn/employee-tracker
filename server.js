//const express = require('express');
const { prompt } = require("inquirer");

// create the connection to database
const mysql = require ('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'employee_db',
});

connection.connect(err => {
  if (err) throw err;
  console.log('connected as id ' + connection.threadId);
  //afterConnection();
});

// afterConnection = () => {
//   connection.query("SELECT * FROM departments", (err, result, fields) => {
//     console.log('err', err);
//     console.log("result", result);
//     console.log("fields", fields);
//     connection.end();
//   })
  

// instantiate the server
//const app = express();






async function showPrompts() {
  const { choice } = await prompt ([
    {
      type: "list",
      name: "choice",
      message: "Choose the task you want to do.",
      choices: [
        {
          name: "View all employees",
          value: "VIEW_EMPLOYEES"
        },
        {
          name: "View all departments",
          value: "VIEW_DEPARTMENTS"
        },
        {
          name: "View all roles",
          value: "VIEW_ROLES"
        },
        {
          name: "Add an employee",
          value: "ADD_EMPLOYEE"
        },
        {
          name: "Add a department",
          value: "ADD_DEPARTMENT"
        },
        {
          name: "Add a role",
          value: "ADD_ROLE"
        },
        {
          name: "Update employee role",
          value: "UPDATE_ROLE"
        },
        {
          name: "Quit",
          value: "QUIT"
        },
      ]
    }
  ]);
  switch (choice) {
    case "VIEW_EMPLOYEES":
      return viewEmployees();
    case "VIEW_DEPARTMENTS":
      return viewDepartments();
    case "VIEW_ROLES":
      return viewRoles();
    case "ADD_EMPLOYEE":
      return addEmployee();
    case "ADD_DEPARTMENT":
      return addDepartment();
    case "ADD_ROLE":
      return addRole();
    case "UPDATE_ROLE":
      return updateRole();
    default:
      return quit();  
  }

  // async function viewEmployees() {
  //   const employees = await
  // }

}

// // simple query
// connection.query(
//   'SELECT * FROM `table` WHERE `name` = "Page" AND `age` > 45',
//   function (err, results, fields) {
//     console.log(results); // results contains rows returned by server
//     console.log(fields); // fields contains extra meta data about results, if available
//   }
// );

// // with placeholder
// connection.query(
//   "SELECT * FROM `table` WHERE `name` = ? AND `age` > ?",
//   ["Page", 45],
//   function (err, results) {
//     console.log(results);
//   }
// );
//********** end mysql2 code in first query

// // make server listen to express.js server
// app.listen(3001, () => {
//   console.log('API server now on port 3001');
// });

showPrompts();