CREATE TABLE courseSwap (
    swapID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isDone BOOLEAN NOT NULL DEFAULT false,
    uEmail TEXT NOT NULL,
    getSectionID INTEGER NOT NULL,
    askSectionID INTEGER NOT NULL,
    createdAt BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    
    CONSTRAINT fk_user_email 
        FOREIGN KEY (uEmail) 
        REFERENCES userinfo(email) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);