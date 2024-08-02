const inquirer = require('inquirer');
require('dotenv').config(); // Load environment variables from .env file
const inquirer = require('inquirer');
const { Client } = require('pg');

// Create a new PostgreSQL client
const client = new Client({
    user: process.env.DB_USER,     // Use environment variable
    host: process.env.DB_HOST,      // Use environment variable
    database: process.env.DB_NAME,  // Use environment variable
    password: process.env.DB_PASSWORD, // Use environment variable
    port: process.env.DB_PORT,      // Use environment variable
});

// Connect to the database
client.connect()
    .then(() => console.log('Connected to the database.'))
    .catch(err => console.error('Connection error', err.stack));




// Function to show the menu
function showMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all employees',
                'Add an employee',
                'Update an employee role',
                'View all roles',
                'Add a role',
                'View all departments',
                'Add a department',             
                
                'Exit'
            ]
        }
    ]).then(answers => {
        handleMenuSelection(answers.action);
    });
}

// Function to handle menu selection
function handleMenuSelection(action) {
    switch (action) {
        case 'View all departments':
            // Call function to view departments
            console.log("Functionality to view departments here.");
            break;
        case 'View all roles':
            // Call function to view roles
            console.log("Functionality to view roles here.");
            break;
        case 'View all employees':
            // Call function to view employees
            console.log("Functionality to view employees here.");
            break;
        case 'Add a department':
            // Call function to add a department
            console.log("Functionality to add a department here.");
            break;
        case 'Add a role':
            // Call function to add a role
            console.log("Functionality to add a role here.");
            break;
        case 'Add an employee':
            // Call function to add an employee
            console.log("Functionality to add an employee here.");
            break;
        case 'Update an employee role':
            // Call function to update an employee role
            console.log("Functionality to update an employee role here.");
            break;
        case 'Exit':
            console.log("Exiting the application.");
            process.exit();
            break;
        default:
            showMenu(); // Show the menu again in case of an error
    }

    // Show the menu again after handling the selection
    showMenu();
}

// Start the application by showing the menu
showMenu();
