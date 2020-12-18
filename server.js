const inquirer = require("inquirer");

// create the connection to database
const mysql = require("mysql2");

// define Database class
let Database = require('./db/database.js');

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
  let query = "SELECT employee.id, employee.first_name, employee.last_name, empRole.title, department.name AS department, empRole.salary FROM employee LEFT JOIN empRole ON employee.role_id = empRole.id LEFT JOIN department on empRole.department_id = department.id"
  console.log("in employee table");
  const rows = await dbase.query(query);
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
        "View all employees",
        "View all departments",
        "View all roles",
        "Add an employee",
        "Add a department",
        "Add a role",
        "Update role",
        "Quit",
      ],
    },
  ]);
};  

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
        await addEmpData(newEmp);
        break;
      }
      case "Add a department": {
        const newDept = await getAddDeptData();
        console.log("Add a new department", newDept);
        await addDeptData(newDept);
        break;
      }
      case "Add a role": {
        const newRole = await getAddRoleData();
        console.log("Add a new role", newRole);
        await addRoleData(newRole);
        break;
      }
      case "Update role": {
        const emp = await getUpdtRoleData();
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


mainChoices();
