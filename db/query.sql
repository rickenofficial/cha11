-- Consultas para departamentos
SELECT * FROM department;

INSERT INTO department (name) VALUES ($1) RETURNING *;

-- Consultas para roles
SELECT * FROM role;

INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *;

-- Consultas para empleados
SELECT * FROM employee;

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *;
