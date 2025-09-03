# Appointment Booking System

A comprehensive appointment booking system built with Node.js, Express, and Prisma, designed for managing student-professor appointments with secure authentication, slot management, and email notifications.

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT, bcrypt
- **Email Service**: Nodemailer with Gmail SMTP
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Development**: ES6 modules, Prisma migrations

## Application Flow

### 1. User Registration & Authentication
- Users can register as either students or professors
- Strong password validation (8+ chars, uppercase, lowercase, number, special character)
- Username validation (3-20 chars, alphanumeric only)
- Email format validation and uniqueness check
- Password is hashed using bcrypt before storage
- JWT token is generated and returned upon successful login
- Users can login with either username or email

### 2. Slot Management (Professors Only)
- Professors can create available time slots for appointments
- Slot validation ensures:
  - Future dates only (not in the past)
  - Maximum 1 year in advance
  - No duplicate slots for the same professor at the same time
- Professors can view and delete their own slots
- Students can view available slots for any professor

### 3. Appointment Booking (Students Only)
- Students can book appointments with professors
- Appointment creation requires:
  - Valid professor ID
  - Available slot ID
  - Reason for appointment (minimum 10 characters)
- System validates:
  - Slot belongs to the specified professor
  - Slot is not already booked
  - Slot is not expired
- Upon successful booking:
  - Slot status changes to "booked"
  - Appointment record is created with "booked" status

### 4. Appointment Management
- Students can view their own appointments (filtered by status)
- Professors can view appointments with them (filtered by status)
- Both parties can cancel appointments
- Cancellation updates appointment status to "cancelled"
- Email notifications are sent when appointments are cancelled

### 5. Email Notifications
- Automated email notifications for appointment cancellations
- Uses HTML templates for professional appearance
- Gmail SMTP integration for reliable delivery
- Template system supports dynamic content (names, dates, etc.)

### 6. Security & Authorization
- JWT-based authentication for protected routes
- Role-based access control (students vs professors)
- Password hashing with bcrypt
- Input validation and sanitization
- Request logging and error handling

### 7. Error Handling & Logging
- Comprehensive error handling with appropriate HTTP status codes
- Winston logging for all requests and errors
- Request timing and performance monitoring
- Detailed error messages for debugging

### 8. Testing
- Complete test suite covering the entire appointment flow
- Integration tests using Jest and Supertest
- Tests cover:
  - User registration and authentication
  - Slot creation and management
  - Appointment booking and cancellation
  - Role-based access control
  - Error scenarios

## API Endpoints

### Authentication
- `POST /user/create` - Register new user
- `POST /user/login` - User login

### User Management
- `GET /user/profile/:username` - Get user profile

### Slot Management
- `POST /slot` - Create new slot (professors only)
- `GET /slots` - Get available slots for a professor
- `DELETE /slot/:slotId` - Delete slot (professors only)

### Appointment Management
- `POST /appointment` - Book appointment (students only)
- `GET /student/appointments` - Get student's appointments
- `GET /professor/appointments` - Get professor's appointments
- `PATCH /appointment` - Cancel appointment

## Database Schema

### User Model
- User information with role-based access (student/professor)
- Secure password storage
- Profile management

### Slot Model
- Time slot management for professors
- Booking status tracking
- Cascade delete relationships

### Appointment Model
- Links students, professors, and slots
- Status tracking (booked/cancelled)
- Reason for appointment
- Timestamps for audit trail

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Configure EMAIL_USER and EMAIL_PASS for email notifications
   ```

3. Initialize database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Run tests:
   ```bash
   npm test
   ```

5. Start the server:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Features

- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Role-Based Access**: Separate functionality for students and professors
- **Slot Management**: Flexible time slot creation and management
- **Appointment Booking**: Streamlined booking process with validation
- **Email Notifications**: Automated notifications for important events
- **Comprehensive Logging**: Request tracking and error monitoring
- **Input Validation**: Robust validation for all user inputs
- **Testing**: Complete test coverage for all functionality
- **Error Handling**: Graceful error handling with appropriate responses

This appointment booking system provides a complete solution for managing student-professor appointments with modern web technologies, ensuring security, scalability, and user-friendly experience.
