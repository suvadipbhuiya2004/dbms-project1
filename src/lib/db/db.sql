--- ENUMS
CREATE TYPE role_enum AS ENUM (
    'ADMIN', 
    'STUDENT', 
    'INSTRUCTOR', 
    'DATA_ANALYST'
);

CREATE TYPE program_enum AS ENUM (
    'CERTIFICATE', 
    'DIPLOMA', 
    'DEGREE'
);

CREATE TYPE content_enum AS ENUM (
    'BOOK', 
    'VIDEO', 
    'NOTES'
);

--- TABLE DEFINITIONS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role role_enum NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (id, role)
);

CREATE TABLE student (
    user_id UUID PRIMARY KEY,
    role role_enum NOT NULL DEFAULT 'STUDENT' CHECK (role = 'STUDENT'),
    name TEXT NOT NULL,
    age INT CHECK (age > 0),
    country TEXT,
    skill_level TEXT,
    category TEXT,

    FOREIGN KEY (user_id, role) REFERENCES users(id, role) ON DELETE CASCADE
);

CREATE TABLE instructor (
    user_id UUID PRIMARY KEY,
    role role_enum NOT NULL DEFAULT 'INSTRUCTOR' CHECK (role = 'INSTRUCTOR'),
    name TEXT NOT NULL,
    experience INT CHECK (experience >= 0),
    rating NUMERIC(3,2) CHECK (rating BETWEEN 0 AND 5),

    FOREIGN KEY (user_id, role) REFERENCES users(id, role) ON DELETE CASCADE
);

CREATE TABLE partner_university (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    country TEXT NOT NULL
);

CREATE TABLE textbook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,

    UNIQUE (title, author)
);

CREATE TABLE topic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE course (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    program_type program_enum NOT NULL,
    duration INT NOT NULL CHECK (duration > 0),
    university_id UUID NOT NULL REFERENCES partner_university(id),
    book_id UUID REFERENCES textbook(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (name, university_id)
);

CREATE INDEX idx_course_university ON course(university_id);

CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    type content_enum NOT NULL,
    body TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_course ON content(course_id);


-- RELATIONSHIPS

CREATE TABLE course_topic (
    course_id UUID REFERENCES course(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topic(id) ON DELETE CASCADE,

    PRIMARY KEY (course_id, topic_id)
);

CREATE INDEX idx_topic_rel ON course_topic(topic_id);

CREATE TABLE teaches (
    inst_id UUID REFERENCES instructor(user_id) ON DELETE CASCADE,
    course_id UUID REFERENCES course(id) ON DELETE CASCADE,
    
    PRIMARY KEY (inst_id, course_id)
);

CREATE INDEX idx_teaches_course ON teaches(course_id);

CREATE TABLE enrollment (
    student_id UUID REFERENCES student(user_id) ON DELETE CASCADE,
    course_id UUID REFERENCES course(id) ON DELETE CASCADE,
    marks INT CHECK (marks BETWEEN 0 AND 100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (student_id, course_id)
);

CREATE INDEX idx_enroll_course ON enrollment(course_id);