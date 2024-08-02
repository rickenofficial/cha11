const inquirer = require('inquirer');
const fs = require('fs');
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,  // Asegúrate de que sea correcto
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const figlet = require('figlet');

figlet('Employ ***** Manager', function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);
});

async function connectDatabase() {
    try {
        await client.connect();
        console.log('Connected to the database.');
    } catch (err) {
        console.error('Connection error', err.stack);
    }
}

// Iniciar la conexión a la base de datos
connectDatabase().then(() => menu());

function menu() {
    inquirer.prompt([{
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: ["View all employees", "View all roles", "View all departments", "Add an employee", "Add a department", "Add a role", "Update an employee's role", "Delete an employee", "Delete a manager", "Delete a role", "Quit"]
    }])
    .then(({ choice }) => {
        if (choice === "View all employees") viewEmployees();
        else if (choice === "View all roles") viewRoles();
        else if (choice === "View all departments") viewDepartments();
        else if (choice === "Add an employee") addEmployee();
        else if (choice === "Add a department") addDepartment();
        else if (choice === "Add a role") addRole();
        else if (choice === "Update an employee's role") updateEmployee();
        else if (choice === "Delete an employee") deleteEmployee();
        else if (choice === "Delete a manager") deleteManager();
        else if (choice === "Delete a role") deleteRole();
        else client.end();
    });
}

// Funciones para manejar las opciones del menú
async function viewDepartments() {
    const departments = await client.query("SELECT * FROM department");
    console.table(departments.rows);
    menu();
}

async function viewRoles() {
    const roles = await client.query("SELECT role.title, role.salary, department.name FROM role JOIN department ON role.department_id = department.id");
    console.table(roles.rows);
    menu();
}

async function viewEmployees() {
    const sql = `SELECT employee.id, employee.first_name AS "first name", employee.last_name AS "last name", role.title, department.name AS department, role.salary, manager.first_name || ' ' || manager.last_name AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id`;
    const employees = await client.query(sql);
    console.table(employees.rows);
    menu();
}

async function addDepartment() {
    try {
        const departmentData = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter department name:'
            }
        ]);

        const query = {
            text: 'INSERT INTO department(name) VALUES($1)',
            values: [departmentData.name]
        };

        await client.query(query);
        console.log('Department added successfully!');
        menu();
    } catch (error) {
        console.error('Error adding department:', error);
        menu();
    }
}

async function addRole() {
    try {
        const departmentQuery = 'SELECT id, name FROM department';
        const departmentResult = await client.query(departmentQuery);
        const departments = departmentResult.rows;

        const departmentChoices = departments.map(department => ({
            name: department.name,
            value: department.id
        }));

        const roleData = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter role title:'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter role salary:'
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select department for this role:',
                choices: departmentChoices
            }
        ]);

        const query = {
            text: 'INSERT INTO role(title, salary, department_id) VALUES($1, $2, $3)',
            values: [roleData.title, roleData.salary, roleData.department_id]
        };

        await client.query(query);
        console.log('Role added successfully!');
        menu();
    } catch (error) {
        console.error('Error adding role:', error);
        menu();
    }
}

async function addEmployee() {
    try {
        const roleQuery = 'SELECT id, title FROM role';
        const roleResult = await client.query(roleQuery);
        const roles = roleResult.rows;

        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id
        }));

        const managerQuery = 'SELECT id, first_name, last_name FROM employee';
        const managerResult = await client.query(managerQuery);
        const managers = managerResult.rows;

        const managerChoices = managers.map(manager => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id
        }));

        const employeeData = await inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: "Enter employee's first name:"
            },
            {
                type: 'input',
                name: 'last_name',
                message: "Enter employee's last name:"
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select employee role:',
                choices: roleChoices
            },
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select employee manager (optional):',
                choices: managerChoices
            }
        ]);

        const query = {
            text: 'INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES($1, $2, $3, $4)',
            values: [employeeData.first_name, employeeData.last_name, employeeData.role_id, employeeData.manager_id || null]
        };

        await client.query(query);
        console.log('Employee added successfully!');
        menu();
    } catch (error) {
        console.error('Error adding employee:', error);
        menu();
    }
}

async function updateEmployee() {
    try {
        const employeeQuery = 'SELECT id, first_name, last_name FROM employee';
        const employeeResult = await client.query(employeeQuery);
        const employees = employeeResult.rows;

        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        const roleQuery = 'SELECT id, title FROM role';
        const roleResult = await client.query(roleQuery);
        const roles = roleResult.rows;

        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id
        }));

        const employeeUpdateData = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select employee to update:',
                choices: employeeChoices
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select new role for the employee:',
                choices: roleChoices
            }
        ]);

        const query = {
            text: 'UPDATE employee SET role_id = $1 WHERE id = $2',
            values: [employeeUpdateData.role_id, employeeUpdateData.employee_id]
        };

        await client.query(query);
        console.log('Employee role updated successfully!');
        menu();
    } catch (error) {
        console.error('Error updating employee role:', error);
        menu();
    }
}

async function deleteEmployee() {
    try {
        const employeeQuery = 'SELECT id, first_name, last_name FROM employee';
        const employeeResult = await client.query(employeeQuery);
        const employees = employeeResult.rows;

        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        const employeeDeleteData = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select employee to delete:',
                choices: employeeChoices
            }
        ]);

        const query = {
            text: 'DELETE FROM employee WHERE id = $1',
            values: [employeeDeleteData.employee_id]
        };

        await client.query(query);
        console.log('Employee deleted successfully!');
        menu();
    } catch (error) {
        console.error('Error deleting employee:', error);
        menu();
    }
}

async function deleteManager() {
    try {
        const managerQuery = `SELECT id, first_name, last_name FROM employee WHERE id IN (SELECT DISTINCT manager_id FROM employee)`;
        const managerResult = await client.query(managerQuery);
        const managers = managerResult.rows;

        const managerChoices = managers.map(manager => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id
        }));

        const managerDeleteData = await inquirer.prompt([
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select manager to delete:',
                choices: managerChoices
            }
        ]);

        const query = {
            text: 'DELETE FROM employee WHERE id = $1',
            values: [managerDeleteData.manager_id]
        };

        await client.query(query);
        console.log('Manager deleted successfully!');
        menu();
    } catch (error) {
        console.error('Error deleting manager:', error);
        menu();
    }
}

async function deleteRole() {
    try {
        const roleQuery = 'SELECT id, title FROM role';
        const roleResult = await client.query(roleQuery);
        const roles = roleResult.rows;

        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id
        }));

        const roleDeleteData = await inquirer.prompt([
            {
                type: 'list',
                name: 'role_id',
                message: 'Select role to delete:',
                choices: roleChoices
            }
        ]);

        const query = {
            text: 'DELETE FROM role WHERE id = $1',
            values: [roleDeleteData.role_id]
        };

        await client.query(query);
        console.log('Role deleted successfully!');
        menu();
    } catch (error) {
        console.error('Error deleting role:', error);
        menu();
    }
}
