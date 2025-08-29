CREATE TYPE modDecision AS ENUM ('pending', 'published', 'rejected');

CREATE TABLE moderatesCourseMaterials (
    materialID UUID NOT NULL,
    moderatorEmail TEXT NOT NULL,
    moderatedAt BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    comment text NOT NULL,
    decisionState modDecision NOT NULL,

    PRIMARY KEY (materialID, moderatorEmail, moderatedAt),


    CONSTRAINT fk_material_ID
        FOREIGN KEY (materialID) 
        REFERENCES courseMaterials(materialID) 
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_moderator_email
        FOREIGN KEY (moderatorEmail) 
        REFERENCES userinfo(email) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
        
);