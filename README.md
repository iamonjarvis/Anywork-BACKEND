# Job Posting Platform Backend

## Overview
This is the backend server for the job posting platform. It handles authentication, job posting, application management, contact management, and messaging functionality. It uses Express.js for API routes and MongoDB for data storage.

## Features
- User authentication (registration, login, JWT token-based)
- Job posting and job application management
- Contact management (add, remove, list contacts)
- Messaging system (chat functionality between users)
- Real-time updates with Socket.IO for messaging

## Technologies
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Socket.IO for real-time messaging
- Mongoose (MongoDB ODM)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/job-platform-backend.git
   cd job-platform-backend
2. Install dependencies:

   npm install
   
4. Set up environment variables:

## Create a .env file at the root of the project.
Add the following variables:

JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
*Start the server:

npm start
The server will run on http://localhost:5000.

## API Documentation
### Authentication Routes (/api/auth)
#### POST /register - Register a new user
  Request Body:

{
  "name": "John Doe",
  "age": 25,
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "password123"
}
 Response:

{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "name": "John Doe"
  }
}
Error Response:
400: Missing required fields
409: User already exists
500: Server error
#### POST /login - Login user
Request Body:

{
  "email": "johndoe@example.com",
  "password": "password123"
}
Response:

{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "name": "John Doe"
  }
}
Error Response:
400: Missing required fields
401: Invalid credentials
500: Server error
### Contact Routes (/api/contacts)
#### POST /add - Add a contact
Request Body:

{
  "receiverId": "receiver_user_id"
}
Response:

{
  "message": "Contact added successfully",
  "contact": {
    "userId": "sender_user_id",
    "contacts": [
      { "contactId": "receiver_user_id" }
    ]
  }
}
Error Response:
400: Missing required field (receiverId)
500: Server error
#### GET / - Get all contacts for the logged-in user
Response:

{
  "contacts": [
    {
      "contactId": "contact_user_id",
      "name": "Contact Name",
      "email": "contact@example.com"
    }
  ]
}
Error Response:
404: No contacts found
500: Server error
#### POST /toggle - Toggle (add/remove) a contact
Request Body:

{
  "receiverId": "contact_user_id",
  "action": "add" // or "remove"
}
Response:

{
  "message": "Contact added successfully",
  "contact": {
    "userId": "sender_user_id",
    "contacts": [
      { "contactId": "contact_user_id" }
    ]
  }
}
Error Response:
400: Missing required fields
500: Server error
### Job Routes (/api/jobs)
#### GET /available - Get all available (open) jobs
Response:

[
  {
    "_id": "job_id",
    "title": "Job Title",
    "description": "Job Description",
    "amount": 100,
    "location": "Job Location",
    "date": "Job Date",
    "time": "Job Time",
    "employer": {
      "username": "employer_username",
      "email": "employer@example.com"
    }
  }
]
Error Response:
500: Server error
#### GET /dashboard - Get jobs applied and posted by the logged-in user
Response:

{
  "appliedJobs": [
    {
      "_id": "job_id",
      "title": "Job Title",
      "status": "open"
    }
  ],
  "postedJobs": [
    {
      "_id": "job_id",
      "title": "Job Title",
      "applicants": [
        { "user": "applicant_user_id", "name": "Applicant Name" }
      ]
    }
  ]
}
Error Response:
500: Server error
#### POST / - Create a job
Request Body:

{
  "title": "Job Title",
  "description": "Job Description",
  "amount": 100,
  "location": "Location",
  "date": "Job Date",
  "time": "Job Time",
  "lat": 12.34,
  "lng": 56.78
}
Response:

{
  "_id": "job_id",
  "title": "Job Title",
  "description": "Job Description",
  "amount": 100,
  "location": "Location",
  "date": "Job Date",
  "time": "Job Time"
}
Error Response:
400: Missing required fields
500: Server error
#### POST /apply/:id - Apply for a job
Request Body:

{
  "comments": "I am interested in this job."
}
Response:

{
  "message": "Application submitted successfully"
}
Error Response:
400: Cannot apply to a closed job
500: Server error
#### POST /:jobId/applications/:applicantId/accept - Accept an application
Response:

{
  "message": "Applicant accepted successfully"
}
Error Response:
500: Server error
#### POST /:jobId/applications/:applicantId/reject - Reject an application
Response:

{
  "message": "Applicant rejected successfully"
}
Error Response:
500: Server error
### Message Routes (/api/messages)
#### POST /send - Send a message
Request Body:

{
  "senderId": "sender_user_id",
  "receiverId": "receiver_user_id",
  "content": "Hello, I am interested in your job post."
}
Response:

{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "senderId": "sender_user_id",
    "receiverId": "receiver_user_id",
    "content": "Hello, I am interested in your job post."
  }
}
Error Response:
500: Server error
#### GET /:senderId/:receiverId - Fetch messages between two users
Response:

[
  {
    "senderId": "sender_user_id",
    "receiverId": "receiver_user_id",
    "content": "Hello",
    "timestamp": "timestamp_here"
  }
]
Error Response:
500: Server error


## Contributing
If you would like to contribute to this project, please fork the repository, create a new branch, and submit a pull request with your changes.
For anyfurther interaction mail me sahilp123456@gmail.com
