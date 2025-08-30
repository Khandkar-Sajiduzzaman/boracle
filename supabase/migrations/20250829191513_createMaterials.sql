CREATE TYPE post_state AS ENUM ('pending', 'published', 'rejected');

CREATE TABLE courseMaterials (
   materialID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   uEmail TEXT DEFAULT 'deleted@g.bracu.ac.bd',
   materialURL TEXT NOT NULL,
   createdAt BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
   courseCode TEXT NOT NULL,
   semester TEXT NOT NULL,
   postState post_state NOT NULL DEFAULT 'pending',
   postDescription TEXT NOT NULL,
   
   -- Foreign key constraints
   CONSTRAINT fk_user_email_material
       FOREIGN KEY (uEmail) 
       REFERENCES userinfo(email) 
       ON DELETE SET DEFAULT 
       ON UPDATE CASCADE,
   
   -- Check constraints
   CONSTRAINT valid_semester_format_material 
       CHECK (semester ~ '^(SPRING|SUMMER|FALL)[0-9]{2}$'),
   
   CONSTRAINT valid_material_url
       CHECK (materialURL LIKE 'https://%')
);