CREATE TYPE decision AS ENUM ('pending', 'published', 'rejected');

CREATE TABLE moderatesCourseMaterials (
    matrialID UUID NOT NULL,
    moderatorEmail TEXT NOT NULL,
    moderatedAt BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    comment text NOT NULL
    decisionState decision NOT NULL

    PRIMARY KEY (materiaID, moderatorEmail, moderatedAt),
    

    CONSTRAINT fk_material_ID
        FOREIGN KEY (materiaID) 
        REFERENCES courseMaterials(materiaID) 
        ON DELETE CASCADE
        ON UPDATE CASCADE

    CONSTRAINT fk_moderator_email
        FOREIGN KEY (moderatorEmail) 
        REFERENCES userinfo(email) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
        
);