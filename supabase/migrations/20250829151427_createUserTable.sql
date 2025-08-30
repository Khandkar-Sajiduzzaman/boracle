
CREATE TYPE user_role AS ENUM ('student', 'admin', 'moderator');


CREATE TABLE userinfo (
    email TEXT PRIMARY KEY,
    userName TEXT NOT NULL,
    userRole user_role NOT NULL DEFAULT 'student',
    createdAt BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    CONSTRAINT valid_bracu_email CHECK (email LIKE '%@g.bracu.ac.bd')
);