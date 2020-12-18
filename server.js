//const express = require('express');
const inquirer = require("inquirer");

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
  
//************************* */
// DATABASE QUERY FUNCTIONS
//************************* */

// view all employees
async function viewAllEmps() {
  let query = 'SELECT * FROM employee';
  const rows = await mysql.query(query);
  console.table(rows);
}

//************************* */
// PROMPT FUNCTIONS
//************************* */

async function showPrompts() {
  return inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Please choose the task you want to do: ",
      choices: [
        {
          name: "View all employees",
          value: "VIEW_ALL_EMPS",
        },
        {
          name: "View all departments",
          value: "VIEW_ALL_DEPTS",
        },
        {
          name: "View all roles",
          value: "VIEW_ROLES",
        },
        {
          name: "Add an employee",
          value: "ADD_EMP",
        },
        {
          name: "Add a department",
          value: "ADD_DEPT",
        },
        {
          name: "Add a role",
          value: "ADD_ROLE",
        },
        {
          name: "Update employee role",
          value: "UPDT_ROLE",
        },
        {
          name: "Quit",
          value: "QUIT",
        },
      ],
    },
  ]);

async function mainChoices() {
  let quitLoop = false;
  while (!quitLoop) {
    const prompt = await showPrompts();

    switch (prompt.choice) {
      case "VIEW_ALL_EMPS": {
        await viewAllEmps();
        break;
      }
      case "VIEW_ALL_DEPTS": {
        await viewAllDepts();
        break;
      }  
      case "VIEW_ROLES": {
        await viewAllRoles();
        break;
      }  
      case "ADD_EMP": {
        const newEmp = await getAddEmpData();
        console.log('Add a new employee', newEmp);
        await addEmpData(newEmp);
        break;
      }  
      case "ADD_DEPT": {
        const newDept = await getAddDeptData();
        console.log('Add a new department', newDept);
        await addDeptData(newDept);
        break;
      }  
      case "ADD_ROLE": {
        const newRole = await getAddRoleData();
        console.log('Add a new role', newRole);
        await addRoleData(newRole);
        break;
      }  
      case "UPDT_ROLE": {
        const emp = await getUpdtRoleData();
        await updtRoleData(emp);
        break;
      }  
      case "QUIT": {
        quitLoop = true;
        // 0 is successful exit
        process.exit(0);
        return;
      }  
      default:
        console.log('Please choose a valid option');
    }  
  }
}
}

showPrompts();