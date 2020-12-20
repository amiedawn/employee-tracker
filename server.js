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
// FUNCTIONS TO PULL NAMES FROM EACH TABLE
//************************* */

// get current list of employees
async function pullEmployees() {
  let query = "SELECT * FROM employee";
  const rows = await dbase.query(query);
  console.log("number of rows returned: ", rows.length);

  let employees = [];
  for (const employee of rows) {
    employees.push(employee.first_name + "" + employee.last_name);
  }
  return employees;
};

// get current list of managers 
async function pullManagers() {
  let query = "SELECT * FROM employee WHERE manager_id IS NULL";
  const rows = await dbase.query(query);
  console.log("number of rows returned: ", rows.length);

  let managers = [];
  for (const employee of rows) {
    managers.push(employee.first_name + "" + employee.last_name);
  }
  return managers;
};

// get current list of dept names 
async function pullDeptNames() {
  let query = "SELECT name FROM department";
  const rows = await dbase.query(query);
  console.log("number of rows returned: ", rows.length);
  
  let departments = [];
  // loop to add new department name
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    departments.push(row.name);
  }
  console.log("departments", departments);
  return departments;
};

// get current list of roles 
async function pullRoles() {
  let query = "SELECT title FROM empRole";
  const rows = await dbase.query(query);
  console.log("number of rows returned: ", rows.length);
  
  let roles = [];
  // loop to add new employee role
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    roles.push(row.title);
  }
  console.log(roles);
  return roles;
};

//************************* */
// EMPLOYEE QUERY FUNCTIONS
//************************* */

// view all employees
async function viewAllEmps() {
  console.log("in view all emps table");
  console.log("");

  //***/ add in manager that the emp reports to
  //let query = "SELECT employee.id AS ID, employee.first_name AS First_Name, employee.last_name AS Last_Name, empRole.title AS Title, department.name AS Department, empRole.salary AS Salary FROM employee CONCAT(m.first_name, ' ', m.last_name) AS Manager FROM employee LEFT JOIN employee manager ON employee.manager_id = manager.id INNER JOIN empRole ON employee.role_id = empRole.id INNER JOIN department ON empRole.department_id = department.id";
  let query =
    "SELECT employee.id, employee.first_name, employee.last_name, empRole.title, department.name AS department, empRole.salary AS salary, CONCAT(employee.first_name, ' ', employee.last_name) AS manager FROM employee INNER JOIN empRole on empRole.id = employee.role_id INNER JOIN department on department.id = empRole.department_id LEFT JOIN employee e on employee.manager_id = e.id";
  console.log("in employee table");
  const rows = await dbase.query(query);
  console.table(rows);
}

// get new emp fname, lname, role, mgr for adding
// employee choices will autofill from pullEmpNames function
async function getAddEmpData() {
  console.log("in add employee table");
  const roles = await pullRoles();
  console.log(roles);
  const managers = await pullManagers();
  console.log(managers);
  return inquirer.prompt([
    {
      name: "fName",
      type: "input",
      message:
        "Please enter the first name of the employee you would like to add: ",
    },
    {
      name: "lName",
      type: "input",
      message:
        "Please enter the last name of the employee you would like to add: ",
    },
    {
      name: "eRole",
      type: "list",
      message: "Please choose this employee's role: ",
      choices: [...roles],
    },
    {
      name: "mgr",
      type: "list",
      message: "Please select this employee's manager: ",
      choices: [...managers],
    },
  ]);
};

async function addEmp(empInfo) {
  // user enters role name, but need role_id
  let roleId = await convertRoleId(empInfo.role);
  console.log("got roleId");
  // user enters manager name, but need manager_id
  let mgrId = await convertDeptId(empInfo.manager);
  console.log("got mgrId");
  let query =
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)";
  console.log("query", query);
  let args = [empInfo.first_name, empInfo.last_name, roleId, mgrId];
  console.log("args", args);
  const rows = await dbase.query(query, args);
  console.log(
    `${empInfo.first_name} ${empInfo.last_name} is successfully added as an employee.`
  );
};

// get employee.id of a manager
// destructure full name to first and last name
async function getEmpId(fullName) {
  let emp = separateFLName(fullName);
  let query =
    "SELECT id FROM employee WHERE employee.first_name=? and employee.last_name=?";
  let args = [emp[0], emp[1]];
  const rows = await dbase.query(query, args);
  console.log("destructure full name to first and last name works");
  return rows[0].id;
}



// returns an array of only first_name and last_name
async function separateFLName(fullName) {
  let emp = fullName.split("");
  if (emp.length == 2) {
    return emp;
  }
  const last_name = emp[emp.length - 1];
  let first_name = "";
  for (let i = 0; i < emp.length - 1; i++) {
    first_Name = first_Name + emp[i] + "";
  }
  return [first_name.trim(), last_name];
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
  return inquirer.prompt([
    {
      name: "deptName",
      type: "input",
      message:
        "Please enter the name of the department you would like to add: ",
    },
  ]);
};

// convert department name to department_id
async function convertDeptId(deptName) {
  let query = "SELECT * FROM department WHERE department.name=?";
  let args = [deptName];
  const rows = await dbase.query(query, args);
  console.log("convert dept name to id works");
  return rows[0].id;
};


// add a new department to the table
async function addDept(deptInfo) {
  const deptName = deptInfo.deptName;
  let query = "INSERT INTO department (name) VALUES (?)";
  let args = [deptName];
  const rows = await dbase.query(query, args);
  console.log(`${deptName} is successfully added as a department.`);
}

//************************* */
// EMPROLE QUERY FUNCTIONS
//************************* */

// view all roles
async function viewAllRoles() {
  console.log("in view all roles table");
  console.log("");

  let query =
    "SELECT empRole.id, empRole.title, department.name AS department, empRole.salary FROM empRole LEFT JOIN department on empRole.department_id = department.id";
  console.log("in role table");
  const rows = await dbase.query(query);
  console.table(rows);
}

// get new role name, salary, and dept for adding
// department choices will autofill from pullDeptNames function
async function getAddRoleData() {
  console.log("in add role table");
  const departments = await pullDeptNames();
  console.log(departments);
  return inquirer.prompt([
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

async function addRole(roleInfo) {
  const deptId = await convertDeptId(roleInfo.roleDept);
  console.log("got role deptId");
  const salary = roleInfo.roleSalary;
  console.log("got role salary");
  const title = roleInfo.roleName;
  console.log("got role title");
  let query =
    "INSERT INTO role (title, salary, department_id) VALUES (?,?,?)";
  console.log("query", query);
  let args = [title, salary, deptId];
  console.log("args", args);
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

// let managers = [];
// // loop to add new manager name
// for (let i = 0; i < rows.length; i++) {
//   const employee = rows[i];
//   managers.push(employee.first_name + '' + employee.last_name);
// }
// console.log("managers", managers);
// return managers;
// };

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

// close database connection when node quits
process.on('Quit', async function(code) {
await dbase.close();
return console.log(`Goodbye! You are closing the application with code ${code}`);
});

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