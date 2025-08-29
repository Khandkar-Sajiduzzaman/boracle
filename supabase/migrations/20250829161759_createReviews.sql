-- Create enum type for review state
CREATE TYPE review_state AS ENUM ('pending', 'published', 'rejected');

-- Create reviews table
CREATE TABLE reviews (
    reviewID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facultyID UUID NOT NULL,
    uEmail TEXT  NOT NULL DEFAULT 'deleted@g.bracu.ac.bd',
    isAnon BOOLEAN NOT NULL DEFAULT false,
    semester TEXT NOT NULL,
    behaviourRating INTEGER NOT NULL,
    teachingRating INTEGER NOT NULL,
    markingRating INTEGER NOT NULL,
    section TEXT NOT NULL,
    courseCode TEXT NOT NULL,
    reviewDescription TEXT,
    postState review_state NOT NULL DEFAULT 'pending',
    createdAt BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    
    -- Foreign key constraints
    CONSTRAINT fk_faculty 
        FOREIGN KEY (facultyID) 
        REFERENCES faculty(facultyID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_user_email_review
        FOREIGN KEY (uEmail) 
        REFERENCES userinfo(email) 
        ON DELETE SET DEFAULT 
        ON UPDATE CASCADE,
    
    -- Check constraints
    CONSTRAINT valid_semester_format 
        CHECK (semester ~ '^(SPRING|SUMMER|FALL)[0-9]{2}$'),

    CONSTRAINT valid_behaviour_rating 
    CHECK (behaviourRating >= 0 AND behaviourRating <= 10),

    CONSTRAINT valid_teaching_rating 
    CHECK (teachingRating >= 0 AND teachingRating <= 10),

    CONSTRAINT valid_marking_rating 
    CHECK (markingRating >= 0 AND markingRating <= 10)

    );