INSERT INTO department (name)
VALUES 
('HR'),
('Finance'),
('IT'),
('Sales and Marketing'),
('Purchasing'),
('Administration'),
('Production');


INSERT INTO empRole (title, salary, department_id)
VALUES 
('Manager', 80000, 2),
('Associate', 50000, 5),
('Engineer', 75000, 3),
('Vice-President', 100000, 6),
('President', 150000, 6),
('Intern', 25000, 4),
('Trainer', 40000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Ross', 'Geller', 3, 4),
('Monica', 'Geller', 5, 5),
('Phoebe', 'Buffay', 1, 6),
('Rachel', 'Green', 4, NULL),
('Joey', 'Tribbiani', 6, NULL),
('Chandler', 'Bing', 2, NULL);