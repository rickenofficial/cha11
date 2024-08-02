INSERT INTO department (name) VALUES ('Engineering'), ('Human Resources'), ('Finance');

INSERT INTO role (title, salary, department_id) VALUES
  ('Software Engineer', 80000, 1),
  ('HR Manager', 60000, 2),
  ('Financial Analyst', 70000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
  ('John', 'Doe', 1, NULL),
  ('Jane', 'Smith', 2, NULL),
  ('Jim', 'Beam', 3, NULL);