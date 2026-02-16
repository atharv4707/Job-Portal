# Job Portal

Portfolio-grade full-stack job portal with role-based auth, job posting, applications, and dashboards.

## Features
- JWT cookie-based auth (register/login/logout/me/refresh)
- Role-based access (`JOBSEEKER`, `EMPLOYER`)
- Profile management for job seekers and employers
- Job CRUD for employers + public job search/filter
- Apply flow with duplicate-apply prevention (`jobId + jobseekerId` unique)
- Job seeker application dashboard
- Employer applicants dashboard with status updates
- Security middleware: `helmet`, `cors`, auth rate limiting
- SQL database with Prisma ORM + MySQL
- API tests with Jest + Supertest

## Stack
- Frontend: HTML, CSS, vanilla JS (Fetch API)
- Backend: Node.js, Express
- Database: MySQL with Prisma
- Testing: Jest, Supertest

## Project Structure
```text
job-portal/
  client/
    *.html
    css/styles.css
    js/*.js
  server/
    prisma/
      schema.prisma
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      utils/
    tests/
  README.md
  CONTRIBUTING.md
  LICENSE
  CODE_OF_CONDUCT.md
```

## Quick Start
1. Install backend dependencies:
```bash
cd server
npm install
```

2. Configure env:
```bash
cp .env.example .env
# PowerShell alternative:
Copy-Item .env.example .env
```
Update values in `.env` if needed.

3. Make sure MySQL is running and create a database (example: `job_portal`).

4. Run Prisma migration and generate client:
```bash
npm run prisma:migrate -- --name init
npm run prisma:generate
```

5. Start server:
```bash
npm run dev
```

6. Open app:
```text
http://localhost:5000
```

7. (Optional) Seed demo data:
```bash
npm run seed
```
Demo credentials:
- Employer: `employer.seed@hirescape.local`
- Job seeker: `seeker.seed@hirescape.local`
- Password: `Password123!` (override via `SEED_PASSWORD` env var)

## API Summary
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/refresh`
- Profile: `/api/profile/me`
- Public profiles: `/api/employers/:id`, `/api/jobseekers/:id`
- Jobs: `/api/jobs`, `/api/jobs/:id`, `/api/jobs/:id/status`, `/api/jobs/:id/apply`
- Dashboards: `/api/jobseeker/applications`, `/api/employer/jobs`, `/api/employer/jobs/:id/applications`
- Applications status: `/api/applications/:id/status`

## Test
From `server/` (after schema is migrated on your test DB):
```bash
npm test
```

## Environment Variables
See `server/.env.example`:
- `NODE_ENV`
- `PORT`
- `CLIENT_ORIGIN`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_EXPIRY`
- `REFRESH_TOKEN_EXPIRY`

## Notes
- Frontend is served as static files through Express.
- Auth tokens are stored in `HttpOnly` cookies.
- This is an MVP foundation; advanced features (uploads, email, analytics, admin moderation) can be added incrementally.
