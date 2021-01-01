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

//************************* */
// FUNCTIONS TO PULL NAMES FROM EACH TABLE
//************************* */

// get current list of employees
async function pullEmployees() {
  let query = "SELECT * FROM employee";
  const rows = await dbase.query(query);
  
  let employees = [];
  for (const employee of rows) {
    employees.push(employee.first_name + " " + employee.last_name);
  }
  return employees;
};

// get current list of managers 
async function pullManagers() {
  let query = "SELECT * FROM employee WHERE manager_id IS NULL";
  const rows = await dbase.query(query);
  
  let employees = [];
  for (const employee of rows) {
    employees.push(employee.first_name + " " + employee.last_name);
  };
  return employees;
};

// get current list of dept names 
async function pullDeptNames() {
  let query = "SELECT name FROM department";
  const rows = await dbase.query(query);
    
  let departments = [];
  // loop to add new department name
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    departments.push(row.name);
  }
  return departments;
};

// get current list of roles 
async function pullRoles() {
  let query = "SELECT title FROM empRole";
  const rows = await dbase.query(query);
   
  let roles = [];
  // loop to add new employee role
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    roles.push(row.title);
  }
  return roles;
};

//************************* */
// EMPLOYEE FUNCTIONS
//************************* */

// view all employees
async function viewAllEmps() {
  let query = "SELECT e.id, e.first_name, e.last_name, title, salary, name AS department, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN empRole r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id";
  const rows = await dbase.query(query);
  console.table(rows);
};

// get manager info to view employees
async function getViewEmpMgr() {
  const managers = await pullManagers();
  return inquirer
    .prompt([
      {
        name: "mgrName",
        type: "list",
        message: "Please choose which manager whose employees you would like to view.",
        choices: [
          ...managers
        ]
      }
    ])
    .then (res => convertEmpId(res.mgrName));
};

// view employees by manager
async function viewEmpByMgr(mgrId) {
  let query = "SELECT * FROM employee WHERE employee.manager_id=?"
  const rows = await dbase.query(query, mgrId);
  console.table(rows);
};

// get department info to view employees
async function getViewEmpDept() {
  const departments = await pullDeptNames();
  return inquirer
    .prompt([
      {
        name: "deptName",
        type: "list",
        message: "In which department would you like to view its employees?",
        choices: [
          ...departments
        ]
      }
    ])
    .then (res => convertDeptId(res.deptName));
};

// view employees by manager
async function viewEmpByDept(deptId) {
  let query =
    "SELECT e.id, e.first_name, e.last_name, title, salary, name AS department, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN empRole r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id WHERE r.department_id=?";
  const rows = await dbase.query(query, deptId);
  console.table(rows);
};

// get new emp fname, lname, role, mgr for adding
// employee choices will autofill from pullEmpNames function
async function getAddEmpData() {
  const roles = await pullRoles();
  const managers = await pullManagers();
  return inquirer
    .prompt([
      {
        name: "first_name",
        type: "input",
        message:
          "Please enter the first name of the employee you would like to add: ",
      },
      {
        name: "last_name",
        type: "input",
        message:
          "Please enter the last name of the employee you would like to add: ",
      },
      {
        name: "role",
        type: "list",
        message: "Please choose this employee's role: ",
        choices: [...roles],
      },
      {
        name: "manager",
        type: "list",
        message: "Please select this employee's manager: ",
        choices: [...managers],
      },
    ]);
};

// add a new employee
async function addEmp(newEmp) {
  let firstName = newEmp.first_name;
  let lastName = newEmp.last_name;
  // user enters role name, but need role_id
  let roleId = await convertRoleId(newEmp.role);
  // user enters manager name, but need manager_id
  let mgrId = await convertEmpId(newEmp.manager);
  let query =
     "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)";
  let args = [firstName, lastName, roleId, mgrId];
  const rows = await dbase.query(query, args);
  console.log(
    `${newEmp.first_name} ${newEmp.last_name} is successfully added as an employee.`
  );
};

// get employee.id of a manager
// destructure full name to first and last name
async function convertEmpId(fullName) {
  let emp = separateFLName(fullName);
  let query =
    "SELECT id FROM employee WHERE employee.first_name=? AND employee.last_name=?";
  let args = [emp[0], emp[1]];
  const rows = await dbase.query(query, args);
  return rows[0].id;
};

// returns an array of only first_name and last_name
// **cannot be an async function
function separateFLName(fullName) {
  // typical first and last name
  let emp = fullName.split(" ");
  if (emp.length == 2) {
    return emp;
  }

  // in case first name is 2 words
  const last_name = emp[emp.length - 1];
  let first_name = " ";
  for (let i = 0; i < emp.length - 1; i++) {
    first_name = first_name + emp[i] + " ";
  }
  return [first_name.trim() + " " + last_name];
};

async function getDelEmpData() {
  const employees = await pullEmployees();
  return inquirer
    .prompt([
      {
        name: "empName",
        type: "list",
        message: "Please choose the name you would like to delete from the database.",
        choices: [
          // populate from database
          ...employees
        ]
      }
    ])
};

async function delEmp(empInfo) {
  const emp = separateFLName(empInfo.empName);
  let query = "DELETE FROM employee WHERE first_name=? AND last_name=?";
  let args = [emp[0], emp[1]];
  const rows = await dbase.query(query, args);
  console.log(`${ empInfo.empName } has been removed from the database.`);
};

//************************* */
// DEPARTMENT FUNCTIONS
//************************* */

// view all departments
async function viewAllDepts() {
  let query = "SELECT id AS ID, name AS Department FROM department";
  const rows = await dbase.query(query);
  console.table(rows);
};

// get new department name for adding
async function getAddDeptData() {
  return inquirer
    .prompt([
      {
        name: "deptName",
        type: "input",
        message:
          "Please enter the name of the department you would like to add: ",
      },
    ]);
};

// add a new department to the table
async function addDept(deptInfo) {
  const deptName = deptInfo.deptName;
  let query = "INSERT INTO department (name) VALUES (?)";
  let args = [deptName];
  const rows = await dbase.query(query, args);
  console.log(`${deptName} is successfully added as a department.`);
};

// convert department name to department_id
async function convertDeptId(deptName) {
  let query = "SELECT * FROM department WHERE department.name=?";
  let args = [deptName];
  const rows = await dbase.query(query, args);
  return rows[0].id;
};

async function getDelDeptData() {
  const departments = await pullDeptNames();
  return inquirer
    .prompt ([
      {
        name: "deptName",
        type: "list",
        message: "Please choose the department you would like to delete from the database.",
        choices: [
          ...departments
        ]
      }
    ])
};

async function delDept(deptInfo) {
  const dept = deptInfo.deptName;
  let query = "DELETE FROM department WHERE department.name=?";
  let args = [dept];
  const rows = await dbase.query(query, args);
  console.log(`${ deptInfo.deptName } has been removed from the database.`);
};

//************************* */
// EMPROLE FUNCTIONS
//************************* */

// view all roles
async function viewAllRoles() {
  let query =
    "SELECT empRole.id, empRole.title, department.name AS department, empRole.salary FROM empRole LEFT JOIN department on empRole.department_id = department.id";
  const rows = await dbase.query(query);
  console.table(rows);
};

// prompts to gather data on new role 
// department choices will autofill from pullDeptNames function
async function getAddRoleData() {
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
        choices: [...departments],
      },
    ]);
};

// add a record to list of roles
async function addRole(roleInfo) {
  const deptId = await convertDeptId(roleInfo.roleDept);
  const salary = roleInfo.roleSalary;
  const title = roleInfo.roleName;
  let query =
    "INSERT INTO empRole (title, salary, department_id) VALUES (?,?,?)";
  let args = [title, salary, deptId];
  const rows = await dbase.query(query, args);
  console.log(`${title} is successfully added as a role.`);
};

// convert role name to role_id
async function convertRoleId(roleName) {
  let query = "SELECT * FROM empRole WHERE empRole.title=?";
  let args = [roleName];
  const rows = await dbase.query(query, args);
  return rows[0].id;
};

// prompts to gather data on employee who needs their role updated
async function getUpdtRoleData() {
  const employees = await pullEmployees();
  const roles = await pullRoles();
  return inquirer
  .prompt([
    {
      name: "empName",
      type: "list",
      message: "Please choose the employee you would like to update: ",
      choices: [
        ...employees
      ]
    },
    {
      name: "newRole",
      type: "list",
      message: "Please choose the new role for this employee: ",
      choices: [
        ...roles
      ]
    }  
  ])
};

// update an employee's role
async function updtRoleData(newEmp) {
  const roleId = await convertRoleId(newEmp.newRole);
  const emp = separateFLName(newEmp.empName);

  let query = 'UPDATE employee SET role_id=? WHERE employee.first_name=? and employee.last_name=?';
  let args = [roleId, emp[0], emp[1]];
  const rows = await dbase.query(query, args);
  console.log(`The record for ${emp[0]} ${emp[1]} has been updated to a new role of ${newEmp.newRole}`); 
};

async function getDelRoleData() {
  const roles = await pullRoles();
  return inquirer
    .prompt ([
      {
        name: "roleName",
        type: "list",
        message: "Please choose the employee role that you would like to delete from the database.",
        choices: [
          ...roles
        ]
      }
    ])
};

async function delRole(roleInfo) {
  const role = roleInfo.roleName;
  let query = "DELETE FROM empRole WHERE empRole.title=?"
  let args = [role];
  const rows = await dbase.query(query, args);
  console.log (`${ role } has been removed from the database.`);
};

//************************* */
// MAIN MENU FUNCTIONS
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
      "View employees by manager",
      "View employees by department",
      "View all departments",
      "View all roles",
      "ADD TO A TABLE:",
      "Add an employee",
      "Add a department",
      "Add a role",
      "OTHER ACTIONS:",
      "Update an employee role",
      "Delete an employee",
      "Delete a department",
      "Delete a role",
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
      await viewAllEmps();
      break;
    }
    case "View employees by manager": {
      const mgr = await getViewEmpMgr();
      await viewEmpByMgr(mgr);
      break;
    }
    case "View employees by department": {
      const dept = await getViewEmpDept();
      await viewEmpByDept(dept);
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
      await addEmp(newEmp);
      break;
    }
    case "Add a department": {
      const newDept = await getAddDeptData();
      await addDept(newDept);
      break;
    }
    case "Add a role": {
      const newRole = await getAddRoleData();
      await addRole(newRole);
      break;
    }
    case "Update an employee role": {
      const emp = await getUpdtRoleData();
      await updtRoleData(emp);
      break;
    }
    case "Delete an employee": {
      const emp = await getDelEmpData();
      await delEmp(emp);
      break;
    }
    case "Delete a department": {
      const dept = await getDelDeptData();
      await delDept(dept);
      break;
    }
    case "Delete a role": {
      const role = await getDelRoleData();
      await delRole(role);
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

// close database connection when node quits
process.on('Quit', async function(code) {
await dbase.close();
return console.log(`Goodbye! You are closing the application with code ${code}`);
});

mainChoices();

