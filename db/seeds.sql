INSERT INTO department (name)
VALUES 
('HR'),
('Finance'),
('IT'),
('Sales and Marketing'),
('Purchasing'),
('Production');

INSERT INTO role (title, salary, department_id)
VALUES 
('Manager', 40000, 1),
('Associate', 30000, 1),
('Manager', 45000, 2),
('Associate', 35000, 2),
('Manager', 50000, 3),
('Associate', 40000, 3),
('Manager', 40000, 4),
('Associate', 30000, 4),
('Manager', 40000, 5),
('Associate', 30000, 5),
('Manager', 35000, 6),
('Associate', 25000, 6);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Ross', 'Geller', 3, 1),
('Monica', 'Geller', 5, 1),
('Phoebe', 'Buffay', 1, 2),
('Rachel', 'Green', 4, 2),
('Joey', 'Tribbiani', 6, 2),
('Chandler', 'Bing', 2, 1);