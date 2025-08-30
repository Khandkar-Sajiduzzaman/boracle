CREATE TABLE savedroutine (
    routineID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routineStr TEXT NOT NULL,
    email TEXT NOT NULL,
    CONSTRAINT fk_email 
        FOREIGN KEY (email) 
        REFERENCES userinfo(email) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);