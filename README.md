<div align="center">
  <a href="https://dbms-bongodb.vercel.app/">
      <img src="./docs/BongoDB_logo.png">
  </a>
</div>
<p align="center">
    <br>
    <a href="#getting-started">Getting Started</a> |
    <a href="#database-design">Database Design</a> |
    <a href="#technology-stack--deployment">Tech Stack used</a> |
    <a href="https://github.com/suvadipbhuiya2004/dbms-project1/blob/main/docs/LabAssignment-4.pdf">Problem Statement</a> |
    <a href="https://github.com/suvadipbhuiya2004/dbms-project1/blob/main/docs/Report.pdf">Report</a>
</p>

# Online Course Management Platform
<a href="https://dbms-bongodb.vercel.app/">BongoDB</a> is a full-stack **web-based Online Course Management Platform** developed as part of a Database Management Systems laboratory project. The system is designed to manage courses, instructors, students, partner universities, and academic analytics within a structured and secure relational database environment.

The platform implements **role-based access control** with four distinct user types — Admin, Instructor, Student, and Data Analyst — each provided with a dedicated dashboard and controlled permissions. It integrates a normalized **PostgreSQL** schema with a **Next.js**-based frontend and backend architecture to ensure **data integrity**, **secure authentication**, and **scalable academic management**.

 - [You can open the website here](https://dbms-bongodb.vercel.app/) !

## Getting Started

### Clone the Repository

Clone the repository in your local machine using `git clone` and then navigate to the project directory:

```bash
$ git clone https://github.com/your-username/your-repository-name.git

$ cd dbms-project1 
```

### Install Dependencies

Install all required npm packages:
```
$ npm install
```

### Environment Configuration

The application requires certain environment variables to connect to the database, 
handle authentication, and manage security settings. These variables must be defined 
inside a `.env` file in the root directory of the project.

If not configured properly, the application will fail to start.

---

#### 1. Create the .env File

Create a `.env.local` file in the root directory:

```
$ touch .env.local
```

#### 2. Required Environment Variables
Add the following variables inside the `.env` file:
 - DATABASE_URL

Connection string for your PostgreSQL database (e.g., NeonDB).
This is used by the backend to establish a secure database connection.
```
DATABASE_URL=your_neon_postgresql_connection_string
```
 - JWT_SECRET
 
 The application requires a `JWT_SECRET` value for authentication.

You can generate a secure random secret using Node.js:
```
$ node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This command will output a random 64-character hexadecimal string.

Copy the generated value and add it to your .env file in the following format:
```
JWT_SECRET=your_generated_secret_here
```

 - SALT_ROUNDS

Defines the number of hashing rounds used by bcrypt when encrypting passwords.
Higher values increase security but require more computation time.
A value of 10 is commonly used in production systems.
```
SALT_ROUNDS=10
```
 - NODE_ENV

Specifies the runtime environment.
Set to development for local development.
```
NODE_ENV=development
```

### Run the Development Server

After configuring the environment variables, start the development server:
```
$ npm run dev
```
The application should now be running on:
```
- Local:         http://localhost:3000
- Network:       http://10.105.56.57:3000
- Environments: .env
```

## Database Design
The complete database design artefacts are available below:

- <a href="https://github.com/suvadipbhuiya2004/dbms-project1/blob/main/docs/ER_diagram.pdf" target="_blank">ER Diagram</a>  
-  <a href="https://github.com/suvadipbhuiya2004/dbms-project1/blob/main/docs/create_tables.sql" target="_blank">Database Schema (SQL Code)</a>

The BongoDB platform is built on a structured and normalised PostgreSQL relational database designed to ensure data integrity, scalability, and efficient querying. The schema follows strong normalisation principles, enforces referential integrity through foreign key constraints, and models real-world academic relationships using well-defined entity and relationship tables.

The database supports role-based system architecture and academic workflow management through the following core components:

### 1. User and Role Management

At the core of the system is a centralised Users entity that manages authentication and identity information for all platform participants.

Each user record stores:

 - Unique identifier (UUID)

 - Email (unique)

 - Encrypted password hash

 - Assigned role (Admin, Student, Instructor, Data Analyst)

The system uses a **role-based extension model**, where role-specific details are stored in separate tables:

 - **Students**

   - Linked to Users via primary key

   - Stores age, country, skill level, and category

 - **Instructors**

   - Linked to Users via primary key

   - Stores experience and rating

This design ensures:

   - Clear separation of authentication and profile data

   - Role-based access control

   - Elimination of redundancy

   - Scalability for adding future roles


### 2. Academic Structure

The academic framework of BongoDB models universities, courses, subjects, and reference materials in a structured relational design. This layer defines how educational programs are organised and associated within the platform.

 - **Partner Universities**

   - Stores university name (unique)

   - Stores country information

   - Each course is associated with exactly one university

 - **Courses**

   - Unique identifier (UUID)

   - Course title

   - Course description

   - Program type (Certificate, Diploma, Degree)

   - Duration (with validity constraints)

   - Associated university (foreign key reference)

   - Optional reference textbook

   - Creation timestamp

   - Enforced uniqueness within a university (no duplicate course titles per university)

 - **Textbooks**

   - Unique identifier (UUID)

   - Title

   - Author

   - Ensures uniqueness of (title, author) combination

 - **Topics**

   - Unique identifier (UUID)

   - Unique topic name

   - Enables subject classification and tagging of courses

This academic structure ensures:

   - Clear hierarchical organization of institutions and programs

   - Controlled classification using enumerated program types

   - Referential integrity between universities and courses

   - Prevention of duplicate academic records

   - Structured foundation for search, filtering, and analytics

### 3. Course Content Management

The course content layer manages all learning materials associated with individual courses. It ensures that academic resources are structured, categorised, and accessible only to authorised users.

 - **Course Content**

   - Each content item is linked to a specific course

   - Content type classification (Book, Video, Notes)

   - Stores learning material body or resource reference

   - Creation timestamp for version tracking

 - Content is accessible only to:

   - Instructors assigned to the course (for creation and management)

   - Students enrolled in the course (for viewing)

This structure ensures:

   - Organised delivery of course materials

   - Clear separation of content by course

   - Controlled access based on role and enrollment

   - Extensibility for additional content types


### 4. Relationship Modelling (Many-to-Many Associations)

The database models real-world academic relationships using dedicated mapping structures to handle many-to-many associations between core entities.

 - **Course–Topic Association**

   - A course can be associated with multiple topics

   - A topic can belong to multiple courses

   - Enables flexible subject categorisation

 - **Instructor–Course Assignment**

   - An instructor can teach multiple courses

   - A course can have multiple instructors

   - Supports collaborative teaching models

 - **Student Enrollment**

   - A student can enrol in multiple courses

   - A course can have multiple students

   - Enrollment records store marks and enrollment timestamps

This relationship modelling ensures:

   - Accurate representation of academic workflows

   - Flexible instructor allocation

   - Proper tracking of student participation and performance

   - Strong referential integrity across entities


### 5. Data Integrity and Optimisation

The database design incorporates multiple mechanisms to maintain data correctness, security, and performance efficiency.

 - Use of UUIDs for globally unique primary keys

 - Foreign key constraints with cascading behaviour where appropriate

 - Enumerated types for controlled values (roles, program types, content types)

 - Unique constraints to prevent duplicate records

 - Indexing on frequently queried attributes

 - Aggregation-friendly schema for analytics and reporting

This approach ensures:

   - High data consistency and reliability

   - Efficient query execution for search and analytics

   - Secure role enforcement

   - Scalability for increasing data volume and future enhancements

## Technology Stack & Deployment

BongoDB is built using a modern full-stack JavaScript architecture designed for scalability, security, and maintainability.

- **Frontend:** Next.js, Tailwind CSS, Zustand  
- **Backend:** Next.js API Routes  
- **Database:** PostgreSQL  
- **Authentication:** JWT (JSON Web Tokens)  
- **Password Security:** bcrypt hashing  
- **Testing:** Vitest  

The application is deployed on **Vercel**, enabling seamless integration with GitHub and automated production builds.  

A **Continuous Integration (CI) pipeline** has been implemented to ensure code quality and reliability. Every push or pull request triggers automated checks and build validation, helping maintain a stable and production-ready main branch.

This structured stack and deployment workflow ensures that BongoDB is not only functionally robust but also engineered in accordance with modern development and DevOps best practices.
