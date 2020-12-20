// terminal prompts
const inquirer = require("inquirer");

// format query tables so they don't have index column and are not strings
const cTable = require("console.table");

// create the connection to database
const mysql = require("mysql2");

// define Database class
let Database = require('./db/database.js');

// connect to database
const dbase = new Database({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "employee_db",
});
console.log("in dbase");

//************************* */
// EMPLOYEE QUERY FUNCTIONS
//************************* */

// view all employees
async function viewAllEmps() {
  console.log("in view all emps table");
  console.log("");

  //***/ add in manager that the emp reports to
  //let query = "SELECT employee.id AS ID, employee.first_name AS First_Name, employee.last_name AS Last_Name, empRole.title AS Title, department.name AS Department, empRole.salary AS Salary FROM employee CONCAT(m.first_name, ' ', m.last_name) AS Manager FROM employee LEFT JOIN employee manager ON employee.manager_id = manager.id INNER JOIN empRole ON employee.role_id = empRole.id INNER JOIN department ON empRole.department_id = department.id";
  let query = "SELECT employee.id, employee.first_name, employee.last_name, empRole.title, department.name AS department, empRole.salary AS salary, CONCAT(employee.first_name, ' ', employee.last_name) AS manager FROM employee INNER JOIN empRole on empRole.id = employee.role_id INNER JOIN department on department.id = empRole.department_id LEFT JOIN employee e on employee.manager_id = e.id";
  console.log("in employee table");
  const rows = await dbase.query(query);
  console.table(rows);
};



//************************* */
// DEPARTMENT QUERY FUNCTIONS
//************************* */

// view all departments
async function viewAllDepts() {
  console.log("in view all depts table");
  console.log("");
  
  let query = "SELECT id AS ID, name AS Department FROM department";
  console.log("in view dept table");
  const rows = await dbase.query(query);
  console.table(rows);
};

// get new department name for adding
async function getAddDeptData() {
  console.log("in add dept table");
  return inquirer
    .prompt([
      {
        name: "deptName",
        type: "input",
        message: "Please enter the name of the department you would like to add: ",
      }
    ])
};
  
// add a new department to the table
async function addDept(deptInfo) {
  const deptName = deptInfo.deptName;
  let query = "INSERT INTO department (name) VALUES (?)";
  let args = [deptName];
  const rows = await dbase.query(query, args);
  console.log(`${deptName} is successfully added as a department.`);
};

// get current list of dept names for when adding a new role
async function pullDeptNames() {
  let query = "SELECT name FROM department";
  const rows = await dbase.query(query);
  console.log("number of rows returned: ", rows.length);
  
  let departments = [];
  // loop to add new department name
  for (i = 0; i < query.length; i++) {
    departments.push(query.name);
  }
  return departments;
};

// convert department name to department_id
async function convertDeptId(deptName) {
  let query = "SELECT * FROM department WHERE department.name=?";
  let args = [deptName];
  const rows = await dbase.query(query, args);
  return rows[0].id;
};

//************************* */
// EMPROLE QUERY FUNCTIONS
//************************* */

// view all roles
async function viewAllRoles() {
  console.log("in view all roles table");
  console.log("");

  let query = 'SELECT empRole.id, empRole.title, department.name AS department, empRole.salary FROM empRole LEFT JOIN department on empRole.department_id = department.id';
  console.log("in role table");
  const rows = await dbase.query(query);
  console.table(rows);
};

// get new role name, salary, and dept for adding
// department choices will autofill from pullDeptNames function
async function getAddRoleData() {
  console.log("in add role table");
  const departments = await pullDeptNames();
  return inquirer
    .prompt([
      {
        name: "roleName",
        type: "input",
        message: "Please enter the name of the role you would like to add: ",
      },
      {
        name: "roleSalary",
        type: "input",
        message: "Please enter the salary for the role you would like to add: ",
      },
      {
        name: "roleDept",
        type: "list",
        message: "Please choose a department who uses this role: ",
        choices: [
          ...departments
        ]
      }
    ])
};
  
async function addRole(roleInfo) {
  const deptId = await convertDeptId(roleInfo.roleDept);
  const salary = roleInfo.roleSalary;
  const title = roleInfo.roleName;
  let query = "INSERT INTO role (title, salary, department_id) VALUES (?,?,?)";
  let args = [title, salary, deptId];
  const rows = await dbase.query(query, args);
  console.log(`${title} is successfully added as a department.`);
};

//************************* */
// PROMPT FUNCTIONS
//************************* */

// prompts for main menu
async function showPrompts() {
  return inquirer
    .prompt([
    {
      type: "list",
      name: "choice",
      message: "Please choose the task you want to do: ",
      choices: [
        "VIEW TABLES:",
        "View all employees",
        "View all departments",
        "View all roles",
        "ADD TO A TABLE:",
        "Add an employee",
        "Add a department",
        "Add a role",
        "OTHER ACTIONS:",
        "Update an employee role",
        "Quit"
      ],
    },
  ]);
};  

// make main menu choice happen
async function mainChoices() {
  let quitLoop = false;
  while (!quitLoop) {
    const prompt = await showPrompts();
    switch (prompt.choice) {
      case "View all employees": {
        console.log("in switch view all emps");
        await viewAllEmps();
        break;
      }
      case "View all departments": {
        await viewAllDepts();
        break;
      }
      case "View all roles": {
        await viewAllRoles();
        break;
      }
      case "Add an employee": {
        const newEmp = await getAddEmpData();
        console.log("Add a new employee", newEmp);
        await addEmp(newEmp);
        break;
      }
      case "Add a department": {
        const newDept = await getAddDeptData();
        console.log("Add a new department", newDept);
        await addDept(newDept);
        break;
      }
      case "Add a role": {
        const newRole = await getAddRoleData();
        console.log("Add a new role", newRole);
        await addRole(newRole);
        break;
      }
      case "Update an employee role": {
        const emp = await getUpdtRoleData();
        console.log("Update an employee role", newRole);
        await updtRoleData(emp);
        break;
      }

      case "Quit": {
        quitLoop = true;
        // 0 is successful exit
        process.exit(0);
        return;
      }
      default:
        console.log("Please choose a valid option");
    }
  }
};



//************************* */
// OTHER FUNCTIONS
//************************* */



// confirm valid entries
// async function validateEntry(input) {
//   console.log('made it to validate input');
//   if ((input.trim() != '') && (input.trim().length <= 30)) {
//     return true;
//   } else {
//     return "Invalid entry. Please make sure your entry is 30 characters or less."
//   }
// };


mainChoices();



//add a department name to list of departments
// async function addRole(roleInfo) {
//   const deptId = await deptInfo.deptName;
//   let query = "INSERT INTO department (name) VALUES (?)";
//   let args = [deptName];
//   const rows = await dbase.query(query, args);
//   console.log(`${deptName} is successfully added as a department.`);
// };

// // edit a department
// async function deptPrompt() {
//   return inquirer
//     .prompt([
//     {
//       type: "list",
//       name: "choice",
//       message: "Please choose the task you want to do: ",
//       choices: [
//         "Add a department",
//         "Delete a department",
//         "Return to main menu"
//       ],
//     }
//   ])
// };

// // make main menu choice happen
// async function editDepartment() {
//   let quitLoop = false;
//   while (!quitLoop) {
//     const prompt = await deptPrompt();
//     switch (prompt.choice) {
//       case "Add a department": {
//         console.log("in switch add dept");
//         await addDept();
//         break;
//       }
//       case "Delete a department": {
//         await viewAllDepts();
//         console.log("in switch delete dept");
//         await deleteDept();
//         break;   
//       }  
//       case "Return to main menu": {
//         quitLoop = true;
//         // 0 is successful exit
//         process.exit(0);
//         return;
//       }
//       default:
//         console.log("Please choose a valid option");
//     }
//   }
// };