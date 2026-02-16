# PROJECT REPORT
## ROLE-BASED JOB PORTAL

## TITLE PAGE
- Project Title: Role-Based Job Portal
- Submitted By: ______________________
- Roll Number: ______________________
- Program / Branch / Semester: ______________________
- Institution: ______________________
- Course: ______________________
- Guided By: ______________________
- Academic Year: ______________________
- Submission Date: ______________________

## CERTIFICATE
This is to certify that the project titled "Role-Based Job Portal" is a bona fide work carried out by ______________________ (Roll No. ______________________) under my guidance and supervision during the academic year ______________________.  
The work submitted is original and has fulfilled the requirements prescribed by the institution for project submission.

Guide Signature: ______________________  
Head of Department: ______________________  
Date: ______________________

## ACKNOWLEDGEMENT
I would like to express my sincere gratitude to my project guide, faculty members, and peers for their support and feedback during the development of this project. I also thank my institution for providing the environment and resources required to complete this work.

## DECLARATION
I declare that this report and the corresponding implementation are based on my own understanding and effort, and that all referenced technologies and documentation have been acknowledged appropriately.

## ABSTRACT
This project implements a full-stack job portal with role-based access for job seekers and employers. The system supports secure authentication, profile management, job posting, job search with filtering, and application status tracking. The backend is developed using Node.js and Express, and data is stored in PostgreSQL using Prisma ORM. The frontend is built with HTML, CSS, and JavaScript. The application demonstrates practical software engineering concepts including REST API design, relational database modeling, authorization checks, and basic automated testing.

## TABLE OF CONTENTS
1. Chapter 1: Introduction  
2. Chapter 2: Literature and Existing System Overview  
3. Chapter 3: Requirements Analysis  
4. Chapter 4: System Design and Implementation  
5. Chapter 5: Database Design  
6. Chapter 6: Testing and Results  
7. Chapter 7: Conclusion and Future Scope  
8. References  
9. Appendices

## CHAPTER 1: INTRODUCTION
### 1.1 Background
Recruitment processes are often fragmented across messaging platforms, spreadsheets, and job boards. This causes inefficiency in application tracking and communication.

### 1.2 Problem Statement
There is a requirement for a single platform that allows:
- role-based secure login,
- structured job publishing by employers,
- searchable job listings for candidates,
- transparent status tracking for applications.

### 1.3 Objectives
- Build a modular role-based job portal.
- Design SQL schema for users, jobs, and applications.
- Implement secure REST APIs with validation and authorization.
- Provide separate dashboard experiences for job seekers and employers.
- Validate key API behavior through tests.

### 1.4 Scope
Included in current project:
- authentication for `JOBSEEKER` and `EMPLOYER`,
- profile management,
- job CRUD and status management,
- apply flow with duplicate-prevention,
- application dashboard for both roles.

Not included in current project:
- payment flows,
- real-time chat,
- advanced recommendation engine,
- full admin moderation panel.

## CHAPTER 2: LITERATURE AND EXISTING SYSTEM OVERVIEW
Typical systems either focus only on job listing or only on applicant tracking. This project combines both basic ATS-like functions and job discovery features in a single web application.

### 2.1 Gaps in Existing Approach
- Candidate and employer workflows are disconnected.
- Application status is not consistently visible to candidates.
- Smaller teams need lightweight but secure full-stack solutions.

### 2.2 Proposed System
The proposed solution provides:
- role-aware authentication,
- secure API layer,
- SQL-backed consistent data model,
- direct frontend integration with backend endpoints.

## CHAPTER 3: REQUIREMENTS ANALYSIS
### 3.1 Functional Requirements
- User register/login/logout.
- Profile create/update for each role.
- Employer can create, edit, delete, and close jobs.
- Candidate can search/filter jobs and apply.
- Employer can review applicants and update status.

### 3.2 Non-Functional Requirements
- Security for credentials and sessions.
- Reliable API validation and error handling.
- Maintainable code organization.
- Responsive UI.

### 3.3 Software Requirements
- Node.js
- npm
- PostgreSQL
- Modern web browser

### 3.4 Hardware Requirements
- Standard laptop/desktop with internet access for package install.

## CHAPTER 4: SYSTEM DESIGN AND IMPLEMENTATION
### 4.1 Architecture
- Presentation Layer: static frontend pages in `client/`
- Application Layer: Express routes/controllers/middleware in `server/src/`
- Data Layer: PostgreSQL via Prisma in `server/prisma/schema.prisma`

### 4.2 Module Description
Authentication and Authorization:
- Files: `server/src/controllers/authController.js`, `server/src/middleware/auth.js`, `server/src/services/authService.js`
- Features: register, login, refresh, logout, role checks

Profile Module:
- File: `server/src/controllers/profileController.js`
- Features: own profile read/update, public profile read

Job Module:
- File: `server/src/controllers/jobController.js`
- Features: create/edit/delete/list/filter/status update

Application Module:
- File: `server/src/controllers/applicationController.js`
- Features: apply, duplicate prevention, dashboard views, status updates

### 4.3 Frontend Implementation
- Home: `client/index.html`
- Authentication: `client/auth.html`
- Jobs Page: `client/jobs.html`
- Job Seeker Dashboard: `client/seeker.html`
- Employer Dashboard: `client/employer.html`
- Shared API utility: `client/js/shared.js`

## CHAPTER 5: DATABASE DESIGN
Schema file: `server/prisma/schema.prisma`

### 5.1 Core Entities
- `User`
- `JobSeekerProfile`
- `EmployerProfile`
- `Job`
- `Application`

### 5.2 Key Constraints
- Unique user email.
- Unique pair `(jobId, jobseekerId)` in `Application`.
- Enum-based role and status control.

### 5.3 Relationship Summary
- One user can have one role-specific profile.
- One employer can post many jobs.
- One job can have many applications.
- One job seeker can apply to many jobs.

## CHAPTER 6: TESTING AND RESULTS
Test file: `server/tests/api.test.js`

### 6.1 Test Cases Covered
- registration and login flow
- employer job creation
- job seeker apply workflow
- prevention of duplicate applications
- role-based access control checks

### 6.2 Observed Outcome
Core API flows are implemented and validated through integration tests and manual dashboard-level checks.

### 6.3 Screenshots to Attach in Final Report
- Home page
- Register/Login page
- Job listing with filters
- Job seeker dashboard
- Employer dashboard with applicant list

## CHAPTER 7: CONCLUSION AND FUTURE SCOPE
The project delivers a complete MVP-level job portal with secure role-based workflows and SQL-backed persistence. It demonstrates core full-stack engineering concepts suitable for academic and portfolio use.

Future improvements:
- resume file upload and storage integration,
- notification emails,
- admin moderation panel,
- analytics and reporting dashboard.

## REFERENCES
1. Express.js Official Documentation  
2. Prisma Official Documentation  
3. PostgreSQL Official Documentation  
4. JSON Web Token (JWT) Documentation  
5. MDN Web Docs (HTTP, Cookies, Fetch API)

## APPENDIX A: API ENDPOINTS
Authentication:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

Profiles:
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /api/employers/:id`
- `GET /api/jobseekers/:id`

Jobs:
- `POST /api/jobs`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`
- `PATCH /api/jobs/:id/status`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/employer/jobs`

Applications:
- `POST /api/jobs/:id/apply`
- `GET /api/jobseeker/applications`
- `GET /api/employer/jobs/:id/applications`
- `PATCH /api/applications/:id/status`

## APPENDIX B: CODE STRUCTURE MAP
Backend:
- `server/src/app.js`
- `server/src/index.js`
- `server/src/config/db.js`
- `server/src/config/prisma.js`
- `server/src/controllers/`
- `server/src/routes/`
- `server/src/middleware/`
- `server/src/services/`
- `server/src/utils/`

Frontend:
- `client/index.html`
- `client/auth.html`
- `client/jobs.html`
- `client/seeker.html`
- `client/employer.html`
- `client/css/styles.css`
- `client/js/`

## APPENDIX C: PERSONAL CONTRIBUTION (MANDATORY TO EDIT)
Write this section in your own words before submission:

1. I selected this project because ________________________________________.
2. The most challenging part for me was ___________________________________.
3. I solved that challenge by _____________________________________________.
4. In the next version, I want to add _____________________________________.
5. The key thing I learned from this project is ____________________________.
