CREATE TABLE initial (
    facultyID UUID NOT NULL,
    facultyInitial TEXT NOT NULL,
    

    PRIMARY KEY (facultyID, facultyInitial),
    

    CONSTRAINT fk_initial_faculty 
        FOREIGN KEY (facultyID) 
        REFERENCES faculty(facultyID) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


CREATE INDEX idx_initial_faculty_id ON initial(facultyID);