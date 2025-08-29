CREATE TABLE faculty (
    facultyID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facultyName TEXT NOT NULL,
    email TEXT NOT NULL,
    imgURL TEXT,

    CONSTRAINT valid_img_url
       CHECK (imgURL LIKE 'https://%')
);
