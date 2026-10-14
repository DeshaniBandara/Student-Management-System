# Student Management System

A full stack web application for managing students and courses, built as an internship onboarding project at Gamage Recruiters (PVT) Ltd.

## Project Status

| Day | Focus | Status |
|---|---|---|
| Day 1 | Planning and environment setup | Completed |
| Day 2 | Database design and backend CRUD APIs | Completed |
| Day 2 | Refactor to DTOs, validation and global exception handling | Completed |
| Day 3 | Frontend UI and API integration | Upcoming |
| Day 4 | Authentication (JWT), validation and security | Upcoming |
| Day 5 | Deployment and final documentation | Upcoming |

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Spring Boot 4 (Java 21), Spring Data JPA, Spring Security, Bean Validation
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT (planned, Day 4)
- **Tools:** Git, GitHub, Postman, IntelliJ IDEA, VS Code

## System Architecture

![Architecture diagram](docs/architecture.png)

The frontend never accesses the database directly. All requests go through the Spring Boot REST API, which handles business logic, validation, authentication and database access.

## Project Structure

```
Student Management System/
├── frontend/                  # Next.js application
├── backend/                   # Spring Boot application
│   └── src/main/java/com/gamage/student_management_system/
│       ├── config/            # Security configuration
│       ├── controller/        # REST controllers
│       ├── dto/
│       │   ├── request/       # Request DTOs (input, with validation)
│       │   └── response/      # Response DTOs (output)
│       ├── entity/            # JPA entities (database tables)
│       ├── exception/         # Custom exceptions and global handler
│       ├── mapper/            # Entity <-> DTO conversion
│       ├── repository/        # Spring Data JPA repositories
│       └── service/           # Business logic
├── postman/                   # Postman collection for API testing
└── docs/                      # Diagrams and documentation
```

### Backend Design

Requests flow through these layers:

```
Request JSON -> Request DTO -> Controller -> Service -> Entity -> Repository -> Database
Response JSON <- Response DTO <- Service (maps Entity to DTO)
```

Entities never leave the service layer. Controllers accept request DTOs and return response DTOs, which keeps internal fields (such as passwords) private and decouples the API from the database.

## Features

**Implemented (backend)**

- CRUD APIs for students and courses
- Assign a course to a student, remove it, and list a course's students
- Request validation with clear error messages
- Consistent JSON error responses
- Duplicate email prevention
- Protection against deleting a course that still has students

**Planned**

- Frontend pages: Login, Dashboard, Students, Courses (Day 3)
- JWT authentication, registration and login APIs (Day 4)
- Role-based access control: ADMIN and USER (Day 4)
- Deployment (Day 5)

## Prerequisites

- Node.js (LTS)
- JDK 21
- Git
- A Supabase project (free tier is enough)
- Postman (for API testing)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/DeshaniBandara/Student-Management-System.git
cd Student-Management-System
```

### 2. Set up the database

1. Create a project in [Supabase](https://supabase.com).
2. Open **Connect** and copy the **Session pooler** connection details (host, port, database, user).
3. Keep your database password safe. It is never stored in this repository.

The tables are created automatically by Hibernate when the backend starts (`spring.jpa.hibernate.ddl-auto=update`).

### 3. Run the backend

Set the environment variables (see below), then run from the `backend` folder.

Windows (PowerShell):

```powershell
cd backend
$env:DB_URL="jdbc:postgresql://<host>:5432/postgres"
$env:DB_USERNAME="<your-db-username>"
$env:DB_PASSWORD="<your-db-password>"
.\mvnw.cmd spring-boot:run
```

Mac/Linux:

```bash
cd backend
export DB_URL="jdbc:postgresql://<host>:5432/postgres"
export DB_USERNAME="<your-db-username>"
export DB_PASSWORD="<your-db-password>"
./mvnw spring-boot:run
```

You can also set the variables in an IntelliJ run configuration. The API runs on `http://localhost:8080`.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Environment Variables

Example files are provided as `.env.example`. Never commit real values.

**Backend**

| Variable | Description |
|---|---|
| `DB_URL` | JDBC connection URL for the Supabase database |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |

**Frontend** (`frontend/.env.local`)

  frontend/src/
  ├── app/          # pages: dashboard, students, courses, login
  ├── components/   # Navbar, Loading, ErrorMessage
  ├── lib/          # axios instance and error helper
  ├── services/     # API calls (courseService, studentService)
  └── types/        # TypeScript types matching the backend DTOs

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL, for example `http://localhost:8080` |

## Database Schema

| Table | Columns |
|---|---|
| `users` | id, full_name, email (unique), password, role |
| `students` | id, first_name, last_name, email (unique), age, phone, course_id (FK to courses) |
| `courses` | id, title, description, credits |

Each student belongs to one course, and a course can have many students (one-to-many).

Row Level Security is enabled on all tables in Supabase. The backend connects directly to the database, so it is not affected.

## API Endpoints

Base URL: `http://localhost:8080`

### Courses

| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/api/courses` | List all courses | 200 |
| GET | `/api/courses/{id}` | Get a course | 200 |
| GET | `/api/courses/{id}/students` | List students in a course | 200 |
| POST | `/api/courses` | Create a course | 201 |
| PUT | `/api/courses/{id}` | Update a course | 200 |
| DELETE | `/api/courses/{id}` | Delete a course (blocked if it has students) | 204 |

### Students

| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/api/students` | List all students | 200 |
| GET | `/api/students/{id}` | Get a student | 200 |
| POST | `/api/students` | Create a student | 201 |
| PUT | `/api/students/{id}` | Update a student | 200 |
| PUT | `/api/students/{studentId}/course/{courseId}` | Assign a course to a student | 200 |
| DELETE | `/api/students/{studentId}/course` | Remove a student's course | 200 |
| DELETE | `/api/students/{id}` | Delete a student | 204 |

Authentication endpoints will be added on Day 4.

### Request and Response Examples

**Create a course** (`POST /api/courses`)

```json
{
  "title": "BSc in ICT",
  "description": "Information and Communication Technology",
  "credits": 120
}
```

**Create or update a student** (`POST /api/students`, `PUT /api/students/{id}`)

```json
{
  "firstName": "Nimal",
  "lastName": "Perera",
  "email": "nimal@example.com",
  "age": 21,
  "phone": "0771234567"
}
```

**Student response** (after assigning a course)

```json
{
  "id": 1,
  "firstName": "Nimal",
  "lastName": "Perera",
  "email": "nimal@example.com",
  "age": 21,
  "phone": "0771234567",
  "course": {
    "id": 1,
    "title": "BSc in ICT",
    "description": "Information and Communication Technology",
    "credits": 120
  }
}
```

### Validation Rules

| Field | Rule |
|---|---|
| Course `title` | required, max 255 characters |
| Course `description` | optional, max 1000 characters |
| Course `credits` | required, positive number |
| Student `firstName`, `lastName` | required, max 255 characters |
| Student `email` | required, valid email, unique |
| Student `age` | optional, 1 to 120 |
| Student `phone` | optional, 7 to 15 digits (may include `+`, `-`, spaces) |

### Error Responses

All errors use one consistent format:

```json
{
  "timestamp": "2026-10-14T05:41:00.188Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/students",
  "validationErrors": {
    "firstName": "First name is required",
    "email": "Email must be valid"
  }
}
```

| Status | When |
|---|---|
| 400 | validation failed, malformed JSON, or an invalid path value |
| 404 | the student or course does not exist |
| 409 | duplicate email, or deleting a course that still has students |

## API Testing

A Postman collection is stored in the `postman/` folder. Open the repository folder in Postman (Git view) to use it. Start the backend first, then run the requests in order: create a course, create a student, assign the course, and so on.

## Security Note

Spring Security is currently configured to allow all requests so the APIs can be tested during development. JWT authentication and role-based access will replace this on Day 4. Do not deploy this version.

## Git Commit Standard

This project follows [Conventional Commits](https://www.conventionalcommits.org):

```
type(scope): short description
```

Examples: `feat(api): add course crud endpoints`, `fix(ui): fix button alignment on mobile`, `docs: update readme`, `config(backend): configure supabase database connection`.

## Deployment

- Frontend: _link to be added_
- Backend: _link to be added_

## Author

Deshani Bandara