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
  
async function addDept(deptInfo) {
  const deptName = deptInfo.deptName;
  let query = "INSERT INTO department (name) VALUES (?)";
  let args = [deptName];
  const rows = await dbase.query(query, args);
  console.log(`${deptName} is successfully added as a department.`);
    //  mainChoices();
};


// async function viewAllDepts() {
//   console.log("in view all depts table");
//   console.log("");

//   await dbase.query('SELECT id AS ID, name AS Department FROM department', (err, res) => {
//     if (err) throw err;
//       console.log("in dept table2");
//       console.table(res);
//       mainChoices();
//   })
// };

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
        "VIEWS:",
        "View all employees",
        "View all departments",
        "View all roles",
        "ADD:",
        "Add an employee",
        "Add a department",
        "Add a role",
        "OTHER:",
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

// edit a department
async function deptPrompt() {
  return inquirer
    .prompt([
    {
      type: "list",
      name: "choice",
      message: "Please choose the task you want to do: ",
      choices: [
        "Add a department",
        "Delete a department",
        "Return to main menu"
      ],
    }
  ])
};

// make main menu choice happen
async function editDepartment() {
  let quitLoop = false;
  while (!quitLoop) {
    const prompt = await deptPrompt();
    switch (prompt.choice) {
      case "Add a department": {
        console.log("in switch add dept");
        await addDept();
        break;
      }
      case "Delete a department": {
        await viewAllDepts();
        console.log("in switch delete dept");
        await deleteDept();
        break;   
      }  
      case "Return to main menu": {
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

// add dept function not working - says column name can't be null, though putting in data
// async function addDept(deptName) {
//   const newDept = deptName.newDept;
//   let query = "INSERT INTO department (name) VALUES (?)";
//   let args = [newDept];
//   const rows = await dbase.query(query, args);
//   console.log(`${newDept} is successfully added as a department.`);
//     //  mainChoices();
// };