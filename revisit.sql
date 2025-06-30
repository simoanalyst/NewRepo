use wency;

CREATE TABLE students (
    student_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    age INT,
    major VARCHAR(50),
    enrollment_year INT
);

INSERT INTO students VALUES
(1, 'Alice', 'Johnson', 20, 'Computer Science', 2022),
(2, 'Brian', 'Smith', 21, 'Mathematics', 2021),
(3, 'Cynthia', 'Wang', 22, 'Physics', 2020),
(4, 'Daniel', 'Brown', 20, 'Engineering', 2022),
(5, 'Eva', 'Martinez', 23, 'Statistics', 2019),
(6, 'Frank', 'White', 24, 'Economics', 2020),
(7, 'Grace', 'Lee', 22, 'Biology', 2021),
(8, 'Henry', 'Taylor', 21, 'Computer Science', 2021),
(9, 'Irene', 'Khan', 20, 'Chemistry', 2022),
(10, 'Jake', 'Nguyen', 23, 'Mathematics', 2020),
(11, 'Karen', 'Ali', 22, 'Engineering', 2021),
(12, 'Leo', 'Kim', 25, 'Computer Science', 2019),
(13, 'Mona', 'Adams', 24, 'Biology', 2020),
(14, 'Nathan', 'Ouma', 22, 'Statistics', 2021),
(15, 'Olivia', 'Bennett', 20, 'Physics', 2022);


select * from students
where enrollment_year > 2020;


-- Find all students majoring in 'Computer Science'
select * from students
where major = 'Computer Science';

-- Count the number of students in each major
select major, count(*) as number_of_students
from students group by major;

-- Get the average age of students
select avg(age) as average_age_of_students
from students;


--Get students aged between 21 and 24
select * from students
where age between 21 and 24;

-- Show unique majors from the student table
select distinct major
from students;


-- table two
CREATE TABLE courses (
    course_id INT PRIMARY KEY,
    course_name VARCHAR(100),
    department VARCHAR(50),
    credits INT,
    instructor VARCHAR(100)
);

INSERT INTO courses VALUES
(101, 'Intro to Programming', 'Computer Science', 3, 'Dr. Muriuki'),
(102, 'Calculus I', 'Mathematics', 4, 'Dr. Owino'),
(103, 'General Physics', 'Physics', 4, 'Dr. Ephantus'),
(104, 'Engineering Mechanics', 'Engineering', 3, 'Dr. Kariuki'),
(105, 'Statistics for Data Science', 'Statistics', 3, 'Dr. Wanjiku'),
(106, 'Microeconomics', 'Economics', 3, 'Dr. Mutiso'),
(107, 'Cell Biology', 'Biology', 4, 'Dr. Gichuki'),
(108, 'Organic Chemistry', 'Chemistry', 4, 'Dr. Ahmed'),
(109, 'Data Structures', 'Computer Science', 3, 'Dr. Kihara'),
(110, 'Linear Algebra', 'Mathematics', 3, 'Dr. Njeri'),
(111, 'Thermodynamics', 'Physics', 3, 'Dr. Wekesa'),
(112, 'Electrical Circuits', 'Engineering', 4, 'Dr. Wachira'),
(113, 'Inferential Statistics', 'Statistics', 3, 'Dr. Ndegwa'),
(114, 'Macroeconomics', 'Economics', 3, 'Dr. Kamau'),
(115, 'Human Anatomy', 'Biology', 3, 'Dr. Okoth');


select * from courses;
-- List all courses with more than 3 credits
select course_name
from courses
where credits > 3;


--  Find courses taught by instructors with 'Dr. W' in their name
select *
from courses
where instructor like 'Dr. W%';


--  List all departments and the number of courses they offer
select department, count(course_name) as course_count
from courses
group by department;

-- Sort courses by credits in descending order
select * from courses
order by credits desc;


select course_name, department,credits
from courses 
where instructor like 'Dr. K%'


select * from students;

select * from students
where major = 'Statistics' or enrollment_year = 2020;


CREATE VIEW sheri AS
SELECT *
FROM students
WHERE major = 'Physics';


select * from sheri
order by enrollment_year desc;

drop view sheri;