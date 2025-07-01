CREATE TABLE EmployeeProjects (
    EmployeeID INT,
    ProjectID INT,
    Role VARCHAR(50),
    StartDate DATE,
    Budget DECIMAL(10,2)
);


INSERT INTO EmployeeProjects (EmployeeID, ProjectID, Role, StartDate, Budget) VALUES
(101, 2001, 'Project Manager', '2023-01-10', 150000.00),
(102, 2002, 'Software Engineer', '2023-02-15', 90000.00),
(103, 2001, 'QA Analyst', '2023-03-20', 50000.00),
(104, 2003, 'Data Analyst', '2023-04-01', 80000.00),
(105, 2002, 'DevOps Engineer', '2023-05-10', 95000.00),
(106, 2004, 'UI/UX Designer', '2023-06-01', 60000.00),
(107, 2003, 'Software Engineer', '2023-06-15', 88000.00),
(108, 2005, 'Project Manager', '2023-07-10', 120000.00),
(109, 2001, 'DevOps Engineer', '2023-07-20', 95000.00),
(110, 2004, 'QA Analyst', '2023-08-01', 55000.00),
(101, 2005, 'Project Manager', '2023-09-10', 130000.00),
(102, 2003, 'Software Engineer', '2023-10-01', 89000.00),
(103, 2002, 'QA Analyst', '2023-10-15', 52000.00),
(104, 2004, 'Data Analyst', '2023-11-01', 83000.00),
(105, 2005, 'DevOps Engineer', '2023-11-10', 97000.00),
(106, 2001, 'UI/UX Designer', '2023-12-01', 61000.00),
(107, 2005, 'Software Engineer', '2023-12-10', 92000.00),
(108, 2002, 'Project Manager', '2024-01-05', 155000.00),
(109, 2003, 'DevOps Engineer', '2024-01-20', 94000.00),
(110, 2005, 'QA Analyst', '2024-02-01', 57000.00);


-- Which employee has worked on the most distinct projects?
select top 1 employeeID, count(distinct Role) as most_distict
from EmployeeProjects
group by employeeID
order by most_distict desc;

-- What is the average budget allocated to each role across all projects?
select role, round(avg(Budget),1) as avg_budget
from EmployeeProjects
group by role
order by avg_budget desc;

-- List all employees who have managed more than one project.
select EmployeeID, count(distinct ProjectID) as count_projectID
from EmployeeProjects
where Role = 'Project Manager'
group by EmployeeID
having count(distinct ProjectID) > 1;


-- Identify projects where total budget exceeds KES 250,000.
select ProjectID , sum(Budget) as sum_budget
from EmployeeProjects
group by ProjectID
having sum(Budget) > 250000;

-- Find the top 3 roles by average budget per assignment.
select top 3 Role, avg(Budget) as avg_budget
from EmployeeProjects
group by Role
order by avg(Budget) desc;


