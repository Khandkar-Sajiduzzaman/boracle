CREATE TABLE askSectionID (
    swapID UUID PRIMARY KEY
    askSectionID INTEGER NOT NULL,

    PRIMARY KEY ()
    CONSTRAINT fk_swapID
        FOREIGN KEY (swapID) 
        REFERENCES courseSwap(swapID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);